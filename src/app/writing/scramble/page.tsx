import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { randomOffset } from "@/lib/listening/pickRandom";
import ScrambleCard from "./ScrambleCard";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export default async function ScramblePage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string }>;
}) {
  const params = await searchParams;
  const current = Math.max(1, Number(params.n) || 1);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { count } = await supabase
    .from("writing_scramble_questions")
    .select("id", { count: "exact", head: true });

  const total = count ?? 0;

  let question = null;
  if (total > 0) {
    const offset = randomOffset(total);
    const { data } = await supabase
      .from("writing_scramble_questions")
      .select("id, hsk_level, words_shuffled, correct_sentence, meaning_ja")
      .order("id", { ascending: true })
      .range(offset, offset);
    question = data?.[0] ?? null;
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/writing" aria-label="書くに戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 19.2, fontWeight: 700, color: "var(--ink)" }}>語順並べ替え</h1>
      </div>

      {question ? (
        <ScrambleCard key={`${question.id}-${current}`} question={question} nextHref={`/writing/scramble?n=${current + 1}`} />
      ) : (
        <p style={{ fontSize: 15.6, color: "var(--ink-soft)", textAlign: "center" }}>問題がありません。</p>
      )}
    </main>
  );
}
