"use client";

import { useState } from "react";
import {
  generateAiSentence,
  recordAiSentenceResult,
  type AiSentence,
} from "@/lib/quiz/ai";

export default function AiQuizCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentence, setSentence] = useState<AiSentence | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [recording, setRecording] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setSentence(null);
    setRevealed(false);

    const result = await generateAiSentence();
    if (result.ok) {
      setSentence(result.sentence);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  async function handleAnswer(correct: boolean) {
    if (!sentence) return;
    setRecording(true);
    await recordAiSentenceResult(sentence.usedWordIds, correct);
    setRecording(false);
    setSentence(null);
    setRevealed(false);
  }

  return (
    <div className="rounded border border-line p-8 text-center">
      {!sentence && (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="rounded bg-seal px-6 py-2 text-sm text-ink disabled:opacity-50"
        >
          {loading ? "AIが例文を作成中…" : "AIに例文を作ってもらう"}
        </button>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {sentence && (
        <>
          <p className="mb-6 text-3xl">{sentence.hanzi}</p>

          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded bg-seal px-6 py-2 text-sm text-ink"
            >
              答えを見る
            </button>
          ) : (
            <>
              <p className="mb-1 text-ink-soft">{sentence.pinyin}</p>
              <p className="mb-2 text-lg">{sentence.meaning_ja}</p>
              {sentence.explanation_ja && (
                <p className="mb-6 text-xs text-ink-soft">
                  {sentence.explanation_ja}
                </p>
              )}
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  disabled={recording}
                  onClick={() => handleAnswer(false)}
                  className="rounded border border-red-300 px-6 py-2 text-sm text-red-600 disabled:opacity-50"
                >
                  できなかった
                </button>
                <button
                  type="button"
                  disabled={recording}
                  onClick={() => handleAnswer(true)}
                  className="rounded bg-green-600 px-6 py-2 text-sm text-white disabled:opacity-50"
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
