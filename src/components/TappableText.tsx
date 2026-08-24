"use client";

import { useRef, useState } from "react";
import SpeakButton from "./SpeakButton";

export type TappableWord = { zh: string; pinyin: string; ja: string };
export type Segment = string | { word: TappableWord };

type Props = {
  segments: Segment[];
  fontSize?: number;
  lineHeight?: number | string;
};

export default function TappableText({ segments, fontSize = 15, lineHeight = 1.9 }: Props) {
  const [activeWord, setActiveWord] = useState<TappableWord | null>(null);
  const [popupLeft, setPopupLeft] = useState(0);
  const [popupTop, setPopupTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTap = (word: TappableWord, e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    if (activeWord?.zh === word.zh) {
      setActiveWord(null);
      return;
    }
    const spanRect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) {
      setActiveWord(word);
      return;
    }
    const top = spanRect.bottom - containerRect.top + 6;
    const left = Math.min(
      Math.max(0, spanRect.left - containerRect.left),
      Math.max(0, containerRect.width - 180),
    );
    setPopupTop(top);
    setPopupLeft(left);
    setActiveWord(word);
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }} onClick={() => setActiveWord(null)}>
      <div style={{ fontSize, lineHeight }}>
        {segments.map((seg, i) => {
          if (typeof seg === "string") return <span key={i}>{seg}</span>;
          const isActive = activeWord?.zh === seg.word.zh;
          return (
            <span
              key={i}
              onClick={(e) => handleTap(seg.word, e)}
              style={{
                borderBottom: isActive ? "none" : "1.5px dashed var(--seal-deep)",
                background: isActive ? "var(--paper-deep)" : undefined,
                borderRadius: isActive ? 4 : undefined,
                paddingBottom: 1,
                cursor: "pointer",
              }}
            >
              {seg.word.zh}
            </span>
          );
        })}
      </div>
      {activeWord && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: popupTop,
            left: popupLeft,
            background: "var(--ink)",
            color: "var(--paper)",
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 12,
            boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
            whiteSpace: "nowrap",
            zIndex: 20,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -6,
              left: 14,
              width: 12,
              height: 12,
              background: "var(--ink)",
              transform: "rotate(45deg)",
              zIndex: -1,
            }}
          />
          <div
            style={{
              color: "color-mix(in srgb, var(--paper) 60%, transparent)",
              fontSize: 11,
              marginBottom: 2,
            }}
          >
            {activeWord.pinyin}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13 }}>
            {activeWord.ja}
            <SpeakButton text={activeWord.zh} size={20} bg="var(--seal)" showSlowButton={false} />
          </div>
        </div>
      )}
    </div>
  );
}
