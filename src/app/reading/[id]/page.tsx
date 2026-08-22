import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReadingQuestions from "./ReadingQuestions";

export default async function ReadingPassagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: passage } = await supabase
    .from("long_passages")
    .select("id, hsk_level, title, body")
    .eq("id", id)
    .maybeSingle();

  if (!passage) {
    notFound();
  }

  const { data: rawQuestions } = await supabase
    .from("passage_questions")
    .select("id, question_order, question_text, choices, correct_choice_index")
    .eq("passage_id", id)
    .order("question_order", { ascending: true });

  // 選択肢の並びはデータ作成時点でランダム化済み(正解の位置が
  // A〜Dに均等に分散するようにCSV生成スクリプト側でシャッフルしてある)。
  const questions = (rawQuestions ?? []).map((q) => ({
    id: q.id,
    question_order: q.question_order,
    question_text: q.question_text,
    choices: q.choices as string[],
    correct_choice_index: q.correct_choice_index,
  }));

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{passage.title}</h1>
        <Link href="/reading" className="text-sm underline">
          一覧に戻る
        </Link>
      </div>

      <p className="mb-4 text-xs text-ink-soft">HSK{passage.hsk_level}級</p>

      <div className="mb-8 whitespace-pre-wrap rounded border border-line p-4 text-sm leading-relaxed">
        {passage.body}
      </div>

      <ReadingQuestions questions={questions} />

      <div className="mt-8 text-center">
        <Link
          href={`/reading/${passage.id}/summary`}
          className="text-sm underline"
        >
          この文章を要約する →
        </Link>
      </div>
    </div>
  );
}
