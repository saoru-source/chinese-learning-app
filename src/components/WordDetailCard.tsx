import SpeakButton from "./SpeakButton";
import PronunciationCheck from "./PronunciationCheck";
import TappableText from "./TappableText";
import PosBadge from "./PosBadge";
import type { ListeningWordDetail } from "@/lib/listening/wordDetail";

// ヒアリング(選択式/ディクテーション)の回答後に、その問題で使われた単語の
// 詳細を表示するカード。/wordsページの単語カード+例文カードと同じ構成・
// 同じコンポーネント(SpeakButton/PronunciationCheck/TappableText)を再利用する。
export default function WordDetailCard({ detail }: { detail: ListeningWordDetail }) {
  const { word, example, exampleSegments } = detail;

  return (
    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          background: "var(--card)",
          borderRadius: 22,
          boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
          padding: "18px 16px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 }}>
          <SpeakButton text={word.hanzi} size={32} layout="column" />
          <span style={{ fontSize: 33.6, fontWeight: 700, color: "var(--ink)" }}>{word.hanzi}</span>
          <PronunciationCheck target={word.hanzi} pinyin={word.pinyin} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
          <p style={{ fontSize: 15.6, fontWeight: 500, color: "var(--ink-soft)" }}>{word.pinyin}</p>
          <PosBadge type={word.word_type} />
        </div>

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 6 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 2 }}>意味</p>
          <p style={{ fontSize: 16.8, fontWeight: 700, color: "var(--ink)" }}>{word.meaning_ja}</p>
        </div>
      </div>

      {example && exampleSegments && (
        <div
          style={{
            background: "var(--card)",
            borderRadius: 20,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            padding: "16px 18px",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <TappableText segments={exampleSegments} fontSize={17} lineHeight={1.7} />
            </div>
            <SpeakButton text={example.hanzi} size={26} />
          </div>

          <p style={{ fontSize: 13.2, color: "var(--ink-soft)", fontWeight: 500, marginTop: 8 }}>
            {example.pinyin}
          </p>
          <p style={{ fontSize: 15.6, color: "var(--ink)", marginTop: 4 }}>{example.meaning_ja}</p>
        </div>
      )}
    </div>
  );
}
