"use client";

import { useEffect, useState } from "react";
import SpeakButton from "@/components/SpeakButton";
import PronunciationCheck from "@/components/PronunciationCheck";
import TappableText, { type Segment } from "@/components/TappableText";
import { pickSpeakerVoices, type SpeakerVoiceOptions } from "@/lib/speech";
import { recordConversationLineResult } from "@/lib/conversations/actions";

// PronunciationCheckの一致度がこの値以上なら「正解」としてprogressに記録する
// (/studyのPASS_THRESHOLDと同じ基準: 85%以上=とても良い、60%以上=惜しい、を
// 踏まえ「惜しい」以上を合格ラインとした)
const PASS_THRESHOLD = 60;

type Line = {
  id: number;
  speaker: string;
  hanzi: string;
  pinyin: string | null;
  meaning_ja: string | null;
  segments: Segment[];
};

const SPEAKER_BADGE_BG = [
  "var(--grad)",
  "linear-gradient(135deg, var(--jade), var(--jade-deep))",
  "linear-gradient(135deg, var(--lavender), var(--seal-deep))",
];

export default function ConversationLines({ characters, lines }: { characters: string[]; lines: Line[] }) {
  const [voiceMap, setVoiceMap] = useState<Record<string, SpeakerVoiceOptions>>({});

  useEffect(() => {
    let cancelled = false;
    pickSpeakerVoices(characters).then((map) => {
      if (!cancelled) setVoiceMap(map);
    });
    return () => {
      cancelled = true;
    };
  }, [characters]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {lines.map((line) => {
        const speakerIndex = characters.indexOf(line.speaker);
        const badgeBg = SPEAKER_BADGE_BG[speakerIndex >= 0 ? speakerIndex % SPEAKER_BADGE_BG.length : 0];
        const voiceOptions = voiceMap[line.speaker] ?? {};

        return (
          <div
            key={line.id}
            style={{
              background: "var(--card)",
              borderRadius: 18,
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
              padding: "14px 16px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: 13.2,
                fontWeight: 700,
                color: "#fff",
                background: badgeBg,
                borderRadius: 999,
                padding: "3px 10px",
                marginBottom: 8,
              }}
            >
              {line.speaker}
            </span>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <TappableText segments={line.segments} fontSize={19.2} lineHeight={1.8} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <SpeakButton text={line.hanzi} size={28} pitch={voiceOptions.pitch} voiceName={voiceOptions.voiceName} />
                <PronunciationCheck
                  target={line.hanzi}
                  pinyin={line.pinyin}
                  onResult={(pct) => {
                    void recordConversationLineResult(line.id, pct >= PASS_THRESHOLD);
                  }}
                />
              </div>
            </div>

            {line.pinyin && (
              <p style={{ fontSize: 13.2, fontWeight: 500, color: "var(--ink-soft)", marginTop: 8 }}>{line.pinyin}</p>
            )}
            {line.meaning_ja && <p style={{ fontSize: 15.6, color: "var(--ink)", marginTop: 4 }}>{line.meaning_ja}</p>}
          </div>
        );
      })}
    </div>
  );
}
