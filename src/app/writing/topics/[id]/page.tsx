import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WritingForm from "./WritingForm";

export default async function WritingTopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: topic } = await supabase
    .from("writing_topics")
    .select("id, hsk_level, category, prompt_text")
    .eq("id", id)
    .maybeSingle();

  if (!topic) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">作文のお題</h1>
        <Link href="/writing/topics" className="text-sm underline">
          お題一覧に戻る
        </Link>
      </div>

      <div className="mb-6 rounded border border-line p-4">
        <p className="mb-1 text-xs text-ink-soft">
          HSK{topic.hsk_level} ・
          {topic.category === "free_topic" ? "自由作文" : "場面設定"}
        </p>
        <p className="text-lg">{topic.prompt_text}</p>
      </div>

      <WritingForm topicId={topic.id} />
    </div>
  );
}
