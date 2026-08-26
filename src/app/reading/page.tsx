import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ReadingTabs from "./ReadingTabs";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export default async function ReadingPage() {
  const supabase = await createClient();
  const { data: passages } = await supabase
    .from("long_passages")
    .select("id, hsk_level, title, body")
    .order("id", { ascending: true });

  const total = passages?.length ?? 0;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/" aria-label="トップに戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 19.2, fontWeight: 700, color: "var(--ink)" }}>長文読解</h1>
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
            fontSize: 28.8,
          }}
        >
          读
        </div>
        <div>
          <p style={{ fontSize: 15.6, fontWeight: 700, color: "#fff" }}>
            {total}本の長文 ・ 各5問の設問
          </p>
          <p style={{ fontSize: 13.2, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
            HSK4〜6の長文を読んで、内容を理解する練習
          </p>
        </div>
      </div>

      <ReadingTabs passages={passages ?? []} />
    </main>
  );
}
