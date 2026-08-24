import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SpeakButton from "@/components/SpeakButton";

// アイコンボックスの背景グラデーションをグループごとに視覚的に区別するために
// 巡回で割り当てる(厳密な色の意味付けはない)
const GROUP_GRADIENTS = [
  "var(--grad)",
  "linear-gradient(135deg, var(--jade), var(--jade-deep))",
  "linear-gradient(135deg, var(--gold), var(--gold-deep))",
  "linear-gradient(135deg, var(--lavender), var(--seal-deep))",
  "linear-gradient(135deg, var(--jade), var(--lavender))",
  "linear-gradient(135deg, var(--seal), var(--gold))",
  "linear-gradient(135deg, var(--gold), var(--jade-deep))",
];

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

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const activeType = params.type === "pos" ? "pos" : "theme";

  const supabase = await createClient();
  const { data: groups } = await supabase
    .from("word_groups")
    .select("id, group_type, category, title")
    .order("id", { ascending: true });

  const groupIds = (groups ?? []).map((g) => g.id);
  const { data: itemRows } = await supabase
    .from("word_group_items")
    .select("group_id")
    .in("group_id", groupIds.length > 0 ? groupIds : [-1]);

  const countByGroup = new Map<number, number>();
  for (const row of itemRows ?? []) {
    countByGroup.set(row.group_id, (countByGroup.get(row.group_id) ?? 0) + 1);
  }

  const themeGroups = (groups ?? []).filter((g) => g.group_type === "theme");
  const posGroups = (groups ?? []).filter((g) => g.group_type === "pos");
  const activeGroups = activeType === "theme" ? themeGroups : posGroups;

  // ハイライトカード用:テーマ別の先頭グループ(対義語)の最初のペアを実データから拾う
  const highlightGroup = themeGroups[0];
  let highlightPair: { left: string; right: string; leftJa: string; rightJa: string } | null = null;
  if (highlightGroup) {
    const { data: pairRows } = await supabase
      .from("word_group_items")
      .select("role, order_index, words(hanzi, meaning_ja)")
      .eq("group_id", highlightGroup.id)
      .eq("order_index", 1);
    type PairWord = { hanzi: string; meaning_ja: string | null };
    const left = pairRows?.find((r) => r.role === "left")?.words as unknown as PairWord | undefined;
    const right = pairRows?.find((r) => r.role === "right")?.words as unknown as PairWord | undefined;
    if (left && right) {
      highlightPair = {
        left: left.hanzi,
        right: right.hanzi,
        leftJa: left.meaning_ja ?? "",
        rightJa: right.meaning_ja ?? "",
      };
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link
          href="/"
          aria-label="トップに戻る"
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>グループ暗記</h1>
      </div>

      {highlightPair && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--grad)",
            borderRadius: 20,
            padding: "16px 18px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              flexShrink: 0,
              background: "rgba(255,255,255,0.25)",
              borderRadius: 14,
              padding: "10px 14px",
              color: "#fff",
              fontSize: 22,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {highlightPair.left} ⇄ {highlightPair.right}
          </div>
          <SpeakButton
            text={`${highlightPair.left} ${highlightPair.right}`}
            size={26}
            bg="rgba(255,255,255,0.25)"
          />
          <div style={{ fontSize: 12, color: "#fff", opacity: 0.9, lineHeight: 1.5 }}>
            <p>
              {highlightPair.leftJa} ⇄ {highlightPair.rightJa}
            </p>
            <p>対義語セットの例</p>
          </div>
        </div>
      )}
      <p style={{ fontSize: 11, color: "var(--ink-soft)", textAlign: "center", marginBottom: 18 }}>
        関連語をまとめて覚えると定着率がアップします
      </p>

      <div
        style={{
          display: "flex",
          background: "var(--paper-deep)",
          borderRadius: 999,
          padding: 4,
          marginBottom: 16,
        }}
      >
        <Link
          href="/groups?type=theme"
          style={{
            flex: 1,
            textAlign: "center",
            padding: "8px 0",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: activeType === "theme" ? 600 : 400,
            color: activeType === "theme" ? "var(--ink)" : "var(--ink-soft)",
            background: activeType === "theme" ? "var(--card)" : "transparent",
            boxShadow: activeType === "theme" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
            textDecoration: "none",
          }}
        >
          テーマ別
        </Link>
        <Link
          href="/groups?type=pos"
          style={{
            flex: 1,
            textAlign: "center",
            padding: "8px 0",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: activeType === "pos" ? 600 : 400,
            color: activeType === "pos" ? "var(--ink)" : "var(--ink-soft)",
            background: activeType === "pos" ? "var(--card)" : "transparent",
            boxShadow: activeType === "pos" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
            textDecoration: "none",
          }}
        >
          品詞別
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {activeGroups.map((g, i) => (
          <Link
            key={g.id}
            href={`/groups/${g.id}`}
            className="active:scale-[0.98] transition-transform"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "var(--card)",
              borderRadius: 16,
              padding: "12px 14px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 42,
                height: 42,
                borderRadius: 13,
                background: GROUP_GRADIENTS[i % GROUP_GRADIENTS.length],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {g.category.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{g.category}</p>
              <p
                style={{
                  fontSize: 10,
                  color: "var(--ink-soft)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {g.title}
              </p>
            </div>
            <span
              style={{
                flexShrink: 0,
                fontSize: 11,
                color: "var(--ink-soft)",
                background: "var(--paper-deep)",
                borderRadius: 20,
                padding: "2px 8px",
              }}
            >
              {countByGroup.get(g.id) ?? 0}語
            </span>
            <ChevronRightIcon />
          </Link>
        ))}
      </div>
    </main>
  );
}
