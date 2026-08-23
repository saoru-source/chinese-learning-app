"use client";

import { speak } from "@/lib/speech";

type Props = {
  text?: string;
  size?: number;
  bg?: string;
};

function SpeakerIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="white" aria-hidden="true">
      <path d="M4 9v6h4l5 5V4L8 9H4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function SpeakButton({ text = "", size = 28, bg }: Props) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    speak(text);
  };

  return (
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
  );
}
