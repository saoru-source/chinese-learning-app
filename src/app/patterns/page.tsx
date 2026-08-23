import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SpeakButton from "@/components/SpeakButton";
import TappableText, { type Segment } from "@/components/TappableText";

const COLLOQUIAL_SITUATIONS = [
  "友達との約束",
  "買い物・値段交渉",
  "体調不良・病院",
  "レストラン・注文",
  "道を尋ねる",
  "SNS・チャット表現",
];

const BUSINESS_SITUATIONS = [
  "メールの書き出し・結び",
  "会議での発言",
  "依頼・お願い",
  "謝罪・お詫び",
  "自己紹介・名刺交換",
  "電話応対",
];

// デモカード用の紹介例文。単語単位のタップ機能を示すため「电影」だけを
// 手動でタップ可能なセグメントにしている(この画面自体には単語分割データが
// 存在しないため、デモの1単語分だけ既知の値を直接指定する形にした)。
const DEMO_SEGMENTS: Segment[] = [
  "周末有空吗？一起去看",
  { word: { zh: "电影", pinyin: "diànyǐng", ja: "映画" } },
  "吧。",
];
const DEMO_HANZI = "周末有空吗？一起去看电影吧。";
const DEMO_PINYIN = "Zhōumò yǒu kòng ma? Yìqǐ qù kàn diànyǐng ba.";
const DEMO_JA = "週末暇？一緒に映画見に行こうよ。";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="var(--ink-soft)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--ink-soft)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export default async function PatternsPage({
  searchParams,
}: {
  searchParams: Promise<{ style?: string }>;
}) {
  const params = await searchParams;
  const activeStyle = params.style === "business" ? "business" : "colloquial";

  const supabase = await createClient();
  const { data: rows } = await supabase.from("sentence_patterns").select("style, situation");

  const counts = new Map<string, number>();
  let colloquialTotal = 0;
  let businessTotal = 0;
  for (const r of rows ?? []) {
    const key = `${r.style}:${r.situation}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (r.style === "colloquial") colloquialTotal++;
    if (r.style === "business") businessTotal++;
  }

  const situations = activeStyle === "colloquial" ? COLLOQUIAL_SITUATIONS : BUSINESS_SITUATIONS;
  const dotColor = activeStyle === "colloquial" ? "var(--jade)" : "var(--lavender)";
  const iconBg =
    activeStyle === "colloquial"
      ? "color-mix(in srgb, var(--jade) 13%, transparent)"
      : "color-mix(in srgb, var(--lavender) 13%, transparent)";

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/" aria-label="トップに戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>例文パターン集</h1>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
          padding: "20px 20px",
          marginBottom: 20,
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: "var(--grad)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 600,
            borderRadius: 20,
            padding: "3px 12px",
            marginBottom: 12,
          }}
        >
          友達との約束
        </span>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <TappableText segments={DEMO_SEGMENTS} fontSize={18} lineHeight={1.7} />
          </div>
          <SpeakButton text={DEMO_HANZI} size={28} />
        </div>

        <p style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-soft)", marginTop: 8 }}>{DEMO_PINYIN}</p>
        <p style={{ fontSize: 14, color: "var(--ink)", marginTop: 4 }}>{DEMO_JA}</p>

        <p style={{ fontSize: 11, color: "var(--ink-soft)", textAlign: "center", marginTop: 14 }}>
          文中の単語をタップすると意味と発音が表示されます
        </p>
      </div>

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
          href="/patterns?style=colloquial"
          style={{
            flex: 1,
            textAlign: "center",
            padding: "8px 0",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: activeStyle === "colloquial" ? 600 : 400,
            color: activeStyle === "colloquial" ? "var(--ink)" : "var(--ink-soft)",
            background: activeStyle === "colloquial" ? "#fff" : "transparent",
            boxShadow: activeStyle === "colloquial" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
            textDecoration: "none",
          }}
        >
          口語 {colloquialTotal}パターン
        </Link>
        <Link
          href="/patterns?style=business"
          style={{
            flex: 1,
            textAlign: "center",
            padding: "8px 0",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: activeStyle === "business" ? 600 : 400,
            color: activeStyle === "business" ? "var(--ink)" : "var(--ink-soft)",
            background: activeStyle === "business" ? "#fff" : "transparent",
            boxShadow: activeStyle === "business" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
            textDecoration: "none",
          }}
        >
          ビジネス {businessTotal}パターン
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {situations.map((s) => (
          <Link
            key={s}
            href={`/patterns/${activeStyle}/${encodeURIComponent(s)}`}
            className="active:scale-[0.98] transition-transform"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#fff",
              borderRadius: 15,
              padding: "13px 16px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: 8,
                background: iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, display: "block" }} />
            </div>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{s}</span>
            <span
              style={{
                flexShrink: 0,
                fontSize: 10,
                color: "var(--ink-soft)",
                background: "var(--paper-deep)",
                borderRadius: 20,
                padding: "2px 8px",
              }}
            >
              {counts.get(`${activeStyle}:${s}`) ?? 0}例文
            </span>
            <ChevronRightIcon />
          </Link>
        ))}
      </div>
    </main>
  );
}
