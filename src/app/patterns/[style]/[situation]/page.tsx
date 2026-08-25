import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SpeakButton from "@/components/SpeakButton";
import PronunciationCheck from "@/components/PronunciationCheck";
import { recordPatternPronunciationResult } from "@/lib/patterns/actions";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="var(--ink-soft)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export default async function PatternSituationPage({
  params,
}: {
  params: Promise<{ style: string; situation: string }>;
}) {
  const { style, situation: rawSituation } = await params;
  const situation = decodeURIComponent(rawSituation);

  if (style !== "colloquial" && style !== "business") {
    notFound();
  }

  const supabase = await createClient();
  const { data: patterns } = await supabase
    .from("sentence_patterns")
    .select("id, hsk_level, hanzi, pinyin, meaning_ja")
    .eq("style", style)
    .eq("situation", situation)
    .order("id", { ascending: true });

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href={`/patterns?style=${style}`} aria-label="一覧に戻る" style={{ display: "flex", alignItems: "center" }}>
            <BackArrowIcon />
          </Link>
          <h1 style={{ fontSize: 19.2, fontWeight: 700, color: "var(--ink)" }}>{situation}</h1>
        </div>
        <span
          style={{
            flexShrink: 0,
            background: "var(--grad)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 20,
            padding: "3px 12px",
          }}
        >
          {style === "colloquial" ? "口語" : "ビジネス"}
        </span>
      </div>

      <p style={{ fontSize: 14.4, color: "var(--ink-soft)", marginBottom: 14 }}>全{patterns?.length ?? 0}件</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {patterns?.map((p) => (
          <div
            key={p.id}
            style={{
              background: "var(--card)",
              borderRadius: 22,
              boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
              padding: "18px 20px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                background: "var(--grad)",
                borderRadius: 6,
                padding: "3px 8px",
                marginBottom: 8,
              }}
            >
              HSK{p.hsk_level}
            </span>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <p style={{ flex: 1, fontSize: 21.6, lineHeight: 1.7, color: "var(--ink)" }}>{p.hanzi}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <SpeakButton text={p.hanzi} size={28} />
                <PronunciationCheck
                  target={p.hanzi}
                  pinyin={p.pinyin}
                  onResult={recordPatternPronunciationResult.bind(null, p.id)}
                />
              </div>
            </div>

            <p style={{ fontSize: 13.2, fontWeight: 500, color: "var(--ink-soft)", marginTop: 8 }}>{p.pinyin}</p>
            <p style={{ fontSize: 16.8, color: "var(--ink)", marginTop: 4 }}>{p.meaning_ja}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
