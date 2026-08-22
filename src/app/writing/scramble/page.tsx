import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ScrambleCard from "./ScrambleCard";

export default async function ScramblePage() {
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
    const offset = Math.floor(Math.random() * total);
    const { data } = await supabase
      .from("writing_scramble_questions")
      .select("id, hsk_level, words_shuffled, correct_sentence, meaning_ja")
      .order("id", { ascending: true })
      .range(offset, offset);
    question = data?.[0] ?? null;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">語順並べ替え</h1>
        <Link href="/writing" className="text-sm underline">
          ライティングに戻る
        </Link>
      </div>

      {question ? (
        <ScrambleCard question={question} />
      ) : (
        <p className="text-sm text-ink-soft">問題がありません。</p>
      )}
    </div>
  );
}
