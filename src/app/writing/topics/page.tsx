import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function WritingTopicsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: topics } = await supabase
    .from("writing_topics")
    .select("id, hsk_level, category, prompt_text")
    .order("id", { ascending: true });

  const freeTopics = (topics ?? []).filter((t) => t.category === "free_topic");
  const scenarios = (topics ?? []).filter((t) => t.category === "scenario");

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">作文のお題</h1>
        <Link href="/writing" className="text-sm underline">
          ライティングに戻る
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold text-ink-soft">自由作文</h2>
        <ul className="flex flex-col gap-2">
          {freeTopics.map((t) => (
            <li key={t.id}>
              <Link
                href={`/writing/topics/${t.id}`}
                className="block rounded border border-line p-3 text-sm"
              >
                <span className="mr-2 text-xs text-ink-soft">
                  HSK{t.hsk_level}
                </span>
                {t.prompt_text}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-ink-soft">場面設定</h2>
        <ul className="flex flex-col gap-2">
          {scenarios.map((t) => (
            <li key={t.id}>
              <Link
                href={`/writing/topics/${t.id}`}
                className="block rounded border border-line p-3 text-sm"
              >
                <span className="mr-2 text-xs text-ink-soft">
                  HSK{t.hsk_level}
                </span>
                {t.prompt_text}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
