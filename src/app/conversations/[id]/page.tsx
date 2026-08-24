import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Segment } from "@/components/TappableText";
import ConversationLines from "./ConversationLines";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

type RawSeg = { text: string; type: "vocab" | "grammar" | "punct"; py?: string; note?: string };

// conversation_lines.segsは{text, type, py, note}の配列で、TappableTextの
// Segment型(string | {word:{zh,pinyin,ja}})とほぼ同じ情報を持つため、
// 句読点はプレーン文字列、それ以外はタップ可能な単語として変換するだけで
// 既存のTappableTextをそのまま再利用できる。
function segsToSegments(segs: RawSeg[] | null): Segment[] {
  if (!segs) return [];
  return segs.map((s) =>
    s.type === "punct" ? s.text : { word: { zh: s.text, pinyin: s.py ?? "", ja: s.note ?? "" } },
  );
}

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, hsk_level, title, characters, grammar_label_raw")
    .eq("id", id)
    .maybeSingle();

  if (!conversation) {
    notFound();
  }

  const { data: rawLines } = await supabase
    .from("conversation_lines")
    .select("id, speaker, hanzi, pinyin, meaning_ja, segs")
    .eq("conversation_id", id)
    .order("line_order", { ascending: true });

  const characters = (conversation.characters as string[] | null) ?? [];

  const lines = (rawLines ?? []).map((l) => ({
    id: l.id,
    speaker: l.speaker ?? "",
    hanzi: l.hanzi,
    pinyin: l.pinyin,
    meaning_ja: l.meaning_ja,
    segments: segsToSegments(l.segs as RawSeg[] | null),
  }));

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <Link href="/conversations" aria-label="一覧に戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <div>
          <p style={{ fontSize: 15.6, fontWeight: 700, color: "var(--ink)" }}>{conversation.title}</p>
          <p style={{ fontSize: 12, color: "var(--ink-soft)" }}>
            HSK{conversation.hsk_level} ・ {characters.join("・")}
          </p>
        </div>
      </div>

      {conversation.grammar_label_raw && (
        <p style={{ fontSize: 13.2, color: "var(--ink-soft)", marginBottom: 14 }}>
          文法ポイント: {conversation.grammar_label_raw}
        </p>
      )}

      {lines.length > 0 ? (
        <ConversationLines characters={characters} lines={lines} />
      ) : (
        <p style={{ fontSize: 15.6, color: "var(--ink-soft)", textAlign: "center" }}>セリフが見つかりませんでした。</p>
      )}
    </main>
  );
}
