"use client";

import { useRef, useState } from "react";
import { useLevel } from "@/lib/level/LevelContext";
import {
  generateAiSentenceBatch,
  recordAiSentenceResult,
  type AiSentence,
  type AiQuizBatchResult,
  type QuizScope,
} from "@/lib/quiz/ai";

const SCOPE_OPTIONS: { key: QuizScope; label: string; description: string }[] = [
  { key: "word", label: "単語", description: "語彙・意味・ピンインを中心に出題" },
  { key: "grammar", label: "文法", description: "文法パターンの用法・穴埋めを中心に出題" },
  { key: "mix", label: "ミックス", description: "単語を中心に、バランスよく出題(デフォルト)" },
];

export default function AiQuizCard() {
  const { levelKey } = useLevel();
  const [scope, setScope] = useState<QuizScope | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AiSentence[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [recording, setRecording] = useState(false);

  // 次の10問をバックグラウンドで先読みした結果。使い切ったタイミングで
  // これが用意済みなら待ち時間ゼロで切り替え、間に合っていなければ
  // (nullのままなら)通常のローディング表示にフォールバックする。
  const nextBatchRef = useRef<AiSentence[] | null>(null);
  const prefetchStartedRef = useRef(false);
  // scope変更/初回読み込みのたびに更新し、古い(切り替え前の)非同期処理の
  // 結果が後から届いてstateを上書きしないようにするためのトークン。
  const sessionTokenRef = useRef(0);

  const sentence = items[index] ?? null;

  async function loadBatch(currentScope: QuizScope, token: number): Promise<AiQuizBatchResult | null> {
    const result = await generateAiSentenceBatch(currentScope, levelKey);
    if (sessionTokenRef.current !== token) return null;
    return result;
  }

  async function handleStart(currentScope: QuizScope) {
    const token = ++sessionTokenRef.current;
    nextBatchRef.current = null;
    prefetchStartedRef.current = false;

    setScope(currentScope);
    setLoading(true);
    setError(null);
    setItems([]);
    setIndex(0);
    setRevealed(false);

    const result = await loadBatch(currentScope, token);
    if (result === null) return;
    if (result.ok) {
      setItems(result.items);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  function startPrefetch(currentScope: QuizScope, token: number) {
    if (prefetchStartedRef.current) return;
    prefetchStartedRef.current = true;
    void generateAiSentenceBatch(currentScope, levelKey).then((result) => {
      if (sessionTokenRef.current !== token) return;
      if (result.ok) {
        nextBatchRef.current = result.items;
      }
      // 失敗時は何もしない。10問使い切った時点でnextBatchRef.currentがnullの
      // ままなら、handleAnswer側のフォールバックで通常のローディングに切り替わる。
    });
  }

  function handleReset() {
    sessionTokenRef.current += 1;
    nextBatchRef.current = null;
    prefetchStartedRef.current = false;
    setScope(null);
    setItems([]);
    setIndex(0);
    setError(null);
    setRevealed(false);
  }

  async function handleAnswer(correct: boolean) {
    if (!sentence || !scope) return;
    const token = sessionTokenRef.current;

    setRecording(true);
    await recordAiSentenceResult(sentence.usedWordIds, sentence.usedGrammarPointId, correct);
    setRecording(false);
    setRevealed(false);

    const nextIndex = index + 1;
    // 現在のバッチの半分程度(10問なら5問目)を解き終えたタイミングで、
    // 残り5問を解いている間に完了するよう次の10問の先読みを開始する。
    const prefetchTriggerIndex = Math.ceil(items.length / 2);
    if (nextIndex === prefetchTriggerIndex) {
      startPrefetch(scope, token);
    }

    if (nextIndex < items.length) {
      setIndex(nextIndex);
      return;
    }

    // このバッチを使い切った
    if (nextBatchRef.current) {
      const nextItems = nextBatchRef.current;
      nextBatchRef.current = null;
      prefetchStartedRef.current = false;
      setItems(nextItems);
      setIndex(0);
      return;
    }

    // 先読みが間に合わなかった場合のフォールバック
    setLoading(true);
    setError(null);
    const result = await loadBatch(scope, token);
    if (result === null) return;
    if (result.ok) {
      prefetchStartedRef.current = false;
      setItems(result.items);
      setIndex(0);
    } else {
      setError(result.error);
      setItems([]);
    }
    setLoading(false);
  }

  if (!scope) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-center text-[16.8px] text-ink-soft">
          出題範囲を選んでください(HSK{levelKey})
        </p>
        {SCOPE_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => void handleStart(opt.key)}
            className="rounded border border-line bg-paper p-4 text-left active:scale-[0.97] transition-transform"
          >
            <p className="font-bold text-ink">{opt.label}</p>
            <p className="text-[14.4px] text-ink-soft">{opt.description}</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded border border-line p-8 text-center">
      <div className="mb-4 flex items-center justify-between text-[14.4px] text-ink-soft">
        <span>
          出題範囲: {SCOPE_OPTIONS.find((o) => o.key === scope)?.label} · HSK{levelKey}
          {items.length > 0 && ` · ${index + 1}/${items.length}問`}
        </span>
        <button
          type="button"
          onClick={handleReset}
          className="underline active:opacity-60 transition-opacity"
        >
          範囲を変更
        </button>
      </div>

      {loading && (
        <p className="inline-flex items-center gap-2 text-[16.8px] text-ink-soft">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-ink-soft border-t-transparent" />
          AIが{items.length === 0 ? "10問分の" : ""}例文を作成中…
        </p>
      )}

      {error && <p className="mt-4 text-[16.8px] text-red-600">{error}</p>}

      {sentence && !loading && (
        <>
          <p className="mb-6 text-[36px]">{sentence.hanzi}</p>

          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded bg-seal px-6 py-2 text-[16.8px] text-ink active:scale-95 transition-transform"
            >
              答えを見る
            </button>
          ) : (
            <>
              <p className="mb-1 text-ink-soft">{sentence.pinyin}</p>
              <p className="mb-2 text-[21.6px]">{sentence.meaning_ja}</p>
              {sentence.explanation_ja && (
                <p className="mb-6 text-[14.4px] text-ink-soft">
                  {sentence.explanation_ja}
                </p>
              )}
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  disabled={recording}
                  onClick={() => handleAnswer(false)}
                  className="rounded border border-red-300 px-6 py-2 text-[16.8px] text-red-600 disabled:opacity-50 active:scale-95 transition-transform"
                >
                  できなかった
                </button>
                <button
                  type="button"
                  disabled={recording}
                  onClick={() => handleAnswer(true)}
                  className="rounded bg-green-600 px-6 py-2 text-[16.8px] text-white disabled:opacity-50 active:scale-95 transition-transform"
                >
                  できた
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
