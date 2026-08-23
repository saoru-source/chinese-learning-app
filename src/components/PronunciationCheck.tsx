"use client";

import { useRef, useState } from "react";

// 姉妹アプリ「HSK会話トレーニング」(claude/HSKconversations.html, HSKspeaking_practice)と
// 同一のアルゴリズムをそのまま流用。句読点等を除去した上でLCS(最長共通部分列)により
// お手本テキストと認識結果を文字単位で照合し、一致度を算出する。
const PUNCT_RE = /[，。！？：；、（）“”"'—…,.!?:;()\s]/g;

function stripForCompare(s: string): string {
  return s.replace(PUNCT_RE, "");
}

function lcsMatch(target: string, said: string): { score: number; matched: boolean[] } {
  const m = target.length;
  const n = said.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (target[i - 1] === said[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const matched = new Array(m).fill(false);
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (target[i - 1] === said[j - 1]) {
      matched[i - 1] = true;
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return { score: dp[m][n], matched };
}

// TypeScriptの標準libにWeb Speech APIの型定義が含まれていないため、
// 実際に使う範囲だけ最小限の型を用意する(anyは使わない)。
interface SpeechRecognitionResultAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionEventLike {
  results: { 0: { 0: SpeechRecognitionResultAlternativeLike } };
}
interface SpeechRecognitionErrorEventLike {
  error?: string;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type Status = "idle" | "unsupported" | "listening" | "error" | "result";

function MicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3M9 21h6" />
    </svg>
  );
}

export default function PronunciationCheck({
  target,
  pinyin,
  onResult,
}: {
  target: string;
  pinyin?: string | null;
  // 発音チェックの一致度(%)が確定した時点で呼ばれる任意コールバック。
  // 段階的暗記画面のように、発音判定の結果を使って正誤を決めたい画面のためのもの。
  // 省略しても既存の見た目・挙動(マイク→判定→再チャレンジ/閉じる)は一切変わらない。
  onResult?: (pct: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [matched, setMatched] = useState<boolean[]>([]);
  const [pct, setPct] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  const cleanTarget = stripForCompare(target);

  function startListening() {
    const SpeechRec = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

    if (!SpeechRec) {
      setStatus("unsupported");
      return;
    }

    const rec = new SpeechRec();
    rec.lang = "zh-CN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    let resultReceived = false;

    rec.onresult = (e) => {
      resultReceived = true;
      const said = stripForCompare(e.results[0][0].transcript || "");
      const { score, matched: m } = lcsMatch(cleanTarget, said);
      const percent = cleanTarget.length > 0 ? Math.round((score / cleanTarget.length) * 100) : 0;
      setMatched(m);
      setPct(percent);
      setStatus("result");
      onResult?.(percent);
    };

    rec.onerror = (e) => {
      resultReceived = true;
      const message =
        e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "マイクの使用が許可されていません。ブラウザの設定をご確認ください。"
          : e.error === "no-speech"
            ? "音声を検出できませんでした。もう一度お試しください。"
            : "音声を聞き取れませんでした。もう一度お試しください。";
      setErrorMessage(message);
      setStatus("error");
    };

    rec.onend = () => {
      recRef.current = null;
      if (!resultReceived) {
        setErrorMessage("音声を検出できませんでした。もう一度お試しください。");
        setStatus("error");
      }
    };

    recRef.current = rec;
    setStatus("listening");
    rec.start();
  }

  function handleOpen() {
    setOpen(true);
    startListening();
  }

  function handleClose() {
    if (recRef.current) {
      recRef.current.stop();
      recRef.current = null;
    }
    setOpen(false);
    setStatus("idle");
  }

  function handleRetry() {
    if (recRef.current) {
      recRef.current.stop();
      recRef.current = null;
    }
    setStatus("idle");
    startListening();
  }

  const verdict = pct >= 85 ? "とても良い発音です" : pct >= 60 ? "惜しい、もう一度" : "もう一度チャレンジ";
  const verdictColor = pct >= 85 ? "var(--match-green)" : pct >= 60 ? "var(--gold-deep)" : "var(--miss-red)";

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="発音をチェック"
        style={{
          flexShrink: 0,
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: "var(--grad)",
          border: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <MicIcon />
      </button>

      {open && (
        <>
          <div
            onClick={handleClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 60 }}
          />
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(340px, 90vw)",
              background: "var(--paper)",
              borderRadius: 20,
              padding: "24px 20px",
              zIndex: 70,
              boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--ink-soft)",
                letterSpacing: "0.08em",
                marginBottom: 16,
              }}
            >
              発音チェック
            </p>

            {status === "unsupported" && (
              <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 20 }}>
                お使いのブラウザは音声認識に対応していません。
              </p>
            )}

            {status === "listening" && (
              <>
                <div style={{ fontSize: 32, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>{target}</div>
                {pinyin && <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 20 }}>{pinyin}</p>}
                <p style={{ fontSize: 13, color: "var(--seal-deep)", fontWeight: 700, marginBottom: 20 }}>
                  聞き取り中…
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <div style={{ fontSize: 32, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>{target}</div>
                <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 20 }}>{errorMessage}</p>
              </>
            )}

            {status === "result" && (
              <>
                <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4, letterSpacing: "0.04em" }}>
                  {cleanTarget.split("").map((ch, i) => (
                    <span key={i} style={{ color: matched[i] ? "var(--match-green)" : "var(--miss-red)" }}>
                      {ch}
                    </span>
                  ))}
                </div>
                {pinyin && <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 12 }}>{pinyin}</p>}
                <p style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>{pct}%</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: verdictColor, marginBottom: 20 }}>{verdict}</p>
              </>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              {status !== "unsupported" && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={status === "listening"}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 999,
                    border: "1px solid var(--line)",
                    background: "#fff",
                    color: "var(--ink)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: status === "listening" ? "default" : "pointer",
                    opacity: status === "listening" ? 0.5 : 1,
                  }}
                >
                  再チャレンジ
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 999,
                  border: "none",
                  background: "var(--grad)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
