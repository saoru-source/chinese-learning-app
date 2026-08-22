import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pickNextWord } from "@/lib/quiz/select";
import QuizCard from "./QuizCard";

export default async function QuizPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const word = await pickNextWord(supabase, user.id);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">クイズ</h1>
        <Link href="/" className="text-sm underline">
          トップに戻る
        </Link>
      </div>
      <p className="mb-6 text-sm">
        <Link href="/quiz/ai" className="underline">
          AIに新しい例文を作ってもらう →
        </Link>
      </p>

      {word ? (
        <QuizCard word={word} />
      ) : (
        <p className="text-sm text-ink-soft">出題できる単語がありません。</p>
      )}
    </div>
  );
}
