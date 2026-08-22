import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ListeningChoiceCard from "./ListeningChoiceCard";

export default async function ListeningChoicePage() {
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
    .eq("mode", "choice");

  const total = count ?? 0;

  let question = null;
  if (total > 0) {
    const offset = Math.floor(Math.random() * total);
    const { data } = await supabase
      .from("listening_questions")
      .select("id, hsk_level, text_zh, correct_answer, choices")
      .eq("mode", "choice")
      .order("id", { ascending: true })
      .range(offset, offset);
    question = data?.[0] ?? null;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">選択式ヒアリング</h1>
        <Link href="/listening" className="text-sm underline">
          ヒアリングに戻る
        </Link>
      </div>

      {question ? (
        <ListeningChoiceCard question={question} />
      ) : (
        <p className="text-sm text-ink-soft">問題がありません。</p>
      )}
    </div>
  );
}
