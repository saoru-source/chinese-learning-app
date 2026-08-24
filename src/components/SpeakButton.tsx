"use client";

import { speak } from "@/lib/speech";

type Props = {
  text?: string;
  size?: number;
  bg?: string;
  // ゆっくり発音(0.5倍速)ボタンを併設するか。既定はtrue。
  // 呼び出し側で表示スペースが足りない場合(小さなチップの繰り返し表示等)にのみfalseにする。
  showSlowButton?: boolean;
  // "row"(横並び、既定)/"column"(縦並び)。単語一覧のように左右対称に
  // 収める必要がある箇所では"column"にして、既存の横幅を変えずに収める。
  layout?: "row" | "column";
  // 会話練習で話者ごとに声を変えるためのオプション。src/lib/speech.tsの
  // pickSpeakerVoices()が返す値をそのまま渡す想定。
  pitch?: number;
  voiceName?: string;
};

function SpeakerIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="white" aria-hidden="true">
      <path d="M4 9v6h4l5 5V4L8 9H4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function SpeakButton({
  text = "",
  size = 28,
  bg,
  showSlowButton = true,
  layout = "row",
  pitch,
  voiceName,
}: Props) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    speak(text, { pitch, voiceName });
  };

  const handleSlowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    speak(text, { rate: 0.5, pitch, voiceName });
  };

  const slowSize = Math.max(Math.round(size * 0.7), 16);

  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: layout === "column" ? "column" : "row",
        alignItems: "center",
        gap: layout === "column" ? 3 : 5,
        flexShrink: 0,
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label="発音を再生"
        style={{
          flexShrink: 0,
          width: size,
          height: size,
          borderRadius: "50%",
          background: bg ?? "var(--grad)",
          border: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          verticalAlign: "middle",
        }}
      >
        <SpeakerIcon size={Math.round(size * 0.53)} />
      </button>

      {showSlowButton && text && (
        <button
          type="button"
          onClick={handleSlowClick}
          aria-label="ゆっくり発音を再生(0.5倍速)"
          title="ゆっくり発音(0.5倍速)"
          style={{
            flexShrink: 0,
            width: slowSize,
            height: slowSize,
            borderRadius: "50%",
            background: "var(--paper-deep)",
            border: "1px solid var(--line)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            verticalAlign: "middle",
            fontSize: Math.max(Math.round(slowSize * 0.6), 10),
            lineHeight: 1,
          }}
        >
          🐢
        </button>
      )}
    </span>
  );
}
