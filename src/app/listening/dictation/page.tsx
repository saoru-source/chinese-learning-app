import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pickWeightedListeningQuestion } from "@/lib/listening/select";
import { fetchListeningWordDetail } from "@/lib/listening/wordDetail";
import ListeningHeader from "../ListeningHeader";
import DictationCard from "./DictationCard";

export default async function ListeningDictationPage({
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
    .from("listening_questions")
    .select("id", { count: "exact", head: true })
    .eq("mode", "dictation");

  const total = count ?? 0;

  const question = total > 0 ? await pickWeightedListeningQuestion(supabase, user.id, "dictation") : null;

  const wordDetail = question ? await fetchListeningWordDetail(supabase, question.text_zh) : null;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <ListeningHeader active="dictation" hskLevel={question?.hsk_level ?? 1} current={current} total={total} />

      {question ? (
        <DictationCard
          key={`${question.id}-${current}`}
          question={question}
          nextHref={`/listening/dictation?n=${current + 1}`}
          wordDetail={wordDetail}
        />
      ) : (
        <p style={{ fontSize: 15.6, color: "var(--ink-soft)", textAlign: "center" }}>問題がありません。</p>
      )}

      <p style={{ fontSize: 13.2, color: "var(--ink-soft)", textAlign: "center", marginTop: 16 }}>
        ブラウザ標準の音声読み上げ機能を使用します
      </p>
    </main>
  );
}
