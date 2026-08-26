import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GrammarWritingList from "./GrammarWritingList";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export default async function GrammarWritingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/writing" aria-label="書くに戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 19.2, fontWeight: 700, color: "var(--ink)" }}>文法の型で例文添削</h1>
      </div>

      <p style={{ fontSize: 14.4, color: "var(--ink-soft)", marginBottom: 16, lineHeight: 1.6 }}>
        指定された文法パターンを使って自分で例文を作り、AIに添削してもらいます。苦手な文法から順に並んでいます。
      </p>

      <GrammarWritingList />
    </main>
  );
}
