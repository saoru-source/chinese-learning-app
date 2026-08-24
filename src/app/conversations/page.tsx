import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const LEVELS = [1, 2, 3, 4];
const LEVEL_DOT: Record<number, string> = {
  1: "var(--jade)",
  2: "var(--seal)",
  3: "var(--gold)",
  4: "var(--lavender)",
};
const LEVEL_BADGE_BG: Record<number, string> = {
  1: "linear-gradient(135deg, var(--jade), var(--jade-deep))",
  2: "var(--grad)",
  3: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
  4: "linear-gradient(135deg, var(--lavender), var(--seal-deep))",
};

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export default async function ConversationsPage() {
  const supabase = await createClient();
  // 一覧ではconversationsのみ取得し、行数の多いconversation_lines(656行)は
  // 詳細画面で会話ごとに絞り込んで取得する(パフォーマンス配慮)。
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, hsk_level, title, characters")
    .order("id", { ascending: true });

  const total = conversations?.length ?? 0;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/learn/speaking" aria-label="話すに戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>会話練習</h1>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "var(--grad)",
          borderRadius: 20,
          padding: "16px 18px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 24,
          }}
        >
          话
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{total}本の会話</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
            話者ごとに声が変わります。発音チェックもできます
          </p>
        </div>
      </div>

      {LEVELS.map((level) => {
        const levelConversations = (conversations ?? []).filter((c) => c.hsk_level === level);
        if (levelConversations.length === 0) return null;
        return (
          <section key={level} style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: LEVEL_DOT[level] }} />
              <h2 style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)" }}>HSK{level}級</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {levelConversations.map((c) => {
                const characters = (c.characters as string[] | null) ?? [];
                return (
                  <Link
                    key={c.id}
                    href={`/conversations/${c.id}`}
                    className="active:scale-[0.98] transition-transform"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: "#fff",
                      borderRadius: 16,
                      padding: "12px 14px",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: LEVEL_BADGE_BG[level],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      {level}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{c.title}</p>
                      <p
                        style={{
                          fontSize: 10,
                          color: "var(--ink-soft)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {characters.join("・")}（{characters.length}人）
                      </p>
                    </div>
                    <ChevronRightIcon />
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
