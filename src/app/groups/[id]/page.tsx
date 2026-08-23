import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SpeakButton from "@/components/SpeakButton";
import PronunciationCheck from "@/components/PronunciationCheck";

type Item = {
  order_index: number;
  role: string | null;
  words: {
    id: number;
    hanzi: string;
    pinyin: string | null;
    meaning_ja: string | null;
  } | null;
};

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
};

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("word_groups")
    .select("id, group_type, category, title")
    .eq("id", id)
    .maybeSingle();

  if (!group) {
    notFound();
  }

  const { data: rawItems } = await supabase
    .from("word_group_items")
    .select("order_index, role, words(id, hanzi, pinyin, meaning_ja)")
    .eq("group_id", id)
    .order("order_index", { ascending: true });

  const items: Item[] = (rawItems ?? []).map((r) => ({
    order_index: r.order_index,
    role: r.role,
    words: Array.isArray(r.words) ? r.words[0] : r.words,
  }));

  const isPairSet = items.some((i) => i.role === "left" || i.role === "right");

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/groups" aria-label="一覧に戻る" style={{ display: "flex", alignItems: "center" }}>
            <BackArrowIcon />
          </Link>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{group.category}</h1>
        </div>
        <span
          style={{
            fontSize: 11,
            color: "var(--ink-soft)",
            background: "var(--paper-deep)",
            borderRadius: 20,
            padding: "2px 10px",
          }}
        >
          {items.length}語
        </span>
      </div>

      {isPairSet ? (
        <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from(new Set(items.map((i) => i.order_index))).map((orderIdx) => {
            const left = items.find((i) => i.order_index === orderIdx && i.role === "left")?.words;
            const right = items.find((i) => i.order_index === orderIdx && i.role === "right")?.words;
            return (
              <li
                key={orderIdx}
                style={{
                  ...cardStyle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  padding: "16px 14px",
                }}
              >
                <WordChip word={left} />
                <span style={{ color: "var(--ink-soft)", fontSize: 15 }}>⇄</span>
                <WordChip word={right} />
              </li>
            );
          })}
        </ul>
      ) : (items[0]?.role ?? "").startsWith("set") ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from(new Set(items.map((i) => i.role))).map((role) => (
            <div key={role} style={{ ...cardStyle, padding: 16 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                {items
                  .filter((i) => i.role === role)
                  .map((i) => (
                    <WordChip key={i.words?.id} word={i.words} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {items.map((i) => (
            <div key={i.words?.id} style={{ ...cardStyle, padding: "14px 12px" }}>
              <WordChip word={i.words} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function WordChip({
  word,
}: {
  word: { hanzi: string; pinyin: string | null; meaning_ja: string | null } | undefined | null;
}) {
  if (!word) return null;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{word.hanzi}</p>
        <SpeakButton text={word.hanzi} size={22} />
        <PronunciationCheck target={word.hanzi} pinyin={word.pinyin} />
      </div>
      <p style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-soft)", marginTop: 2 }}>{word.pinyin}</p>
      <p style={{ fontSize: 12, color: "var(--ink)" }}>{word.meaning_ja}</p>
    </div>
  );
}
