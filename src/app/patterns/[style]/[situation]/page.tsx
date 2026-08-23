import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PronunciationCheck from "@/components/PronunciationCheck";

export default async function PatternSituationPage({
  params,
}: {
  params: Promise<{ style: string; situation: string }>;
}) {
  const { style, situation: rawSituation } = await params;
  const situation = decodeURIComponent(rawSituation);

  if (style !== "colloquial" && style !== "business") {
    notFound();
  }

  const supabase = await createClient();
  const { data: patterns } = await supabase
    .from("sentence_patterns")
    .select("id, hsk_level, hanzi, pinyin, meaning_ja")
    .eq("style", style)
    .eq("situation", situation)
    .order("id", { ascending: true });

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{situation}</h1>
        <Link href="/patterns" className="text-sm underline">
          一覧に戻る
        </Link>
      </div>

      <p className="mb-4 text-sm text-ink-soft">
        {style === "colloquial" ? "口語" : "ビジネス"} ・全{patterns?.length ?? 0}件
      </p>

      <ul className="flex flex-col gap-3">
        {patterns?.map((p) => (
          <li key={p.id} className="rounded border border-line p-4">
            <p className="mb-1 text-xs text-ink-soft">HSK{p.hsk_level}</p>
            <div className="mb-1 flex items-center gap-2">
              <p className="text-lg">{p.hanzi}</p>
              <PronunciationCheck target={p.hanzi} pinyin={p.pinyin} />
            </div>
            <p className="text-sm text-ink-soft">{p.pinyin}</p>
            <p className="text-sm">{p.meaning_ja}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
