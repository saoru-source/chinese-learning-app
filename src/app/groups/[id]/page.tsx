import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Item = {
  order_index: number;
  role: string | null;
  words: {
    id: number;
    hanzi: string;
    pinyin: string | null;
    meaning_ja: string | null;
  } | null;
};

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: group } = await supabase
    .from("word_groups")
    .select("id, group_type, category, title")
    .eq("id", id)
    .maybeSingle();

  if (!group) {
    notFound();
  }

  const { data: rawItems } = await supabase
    .from("word_group_items")
    .select("order_index, role, words(id, hanzi, pinyin, meaning_ja)")
    .eq("group_id", id)
    .order("order_index", { ascending: true });

  const items: Item[] = (rawItems ?? []).map((r) => ({
    order_index: r.order_index,
    role: r.role,
    words: Array.isArray(r.words) ? r.words[0] : r.words,
  }));

  const isPairSet = items.some((i) => i.role === "left" || i.role === "right");

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{group.category}</h1>
        <Link href="/groups" className="text-sm underline">
          一覧に戻る
        </Link>
      </div>

      {isPairSet ? (
        <ul className="flex flex-col gap-3">
          {Array.from(
            new Set(items.map((i) => i.order_index))
          ).map((orderIdx) => {
            const left = items.find(
              (i) => i.order_index === orderIdx && i.role === "left"
            )?.words;
            const right = items.find(
              (i) => i.order_index === orderIdx && i.role === "right"
            )?.words;
            return (
              <li
                key={orderIdx}
                className="flex items-center justify-center gap-4 rounded border border-line p-4"
              >
                <WordChip word={left} />
                <span className="text-ink-soft">⇄</span>
                <WordChip word={right} />
              </li>
            );
          })}
        </ul>
      ) : (items[0]?.role ?? "").startsWith("set") ? (
        <div className="flex flex-col gap-4">
          {Array.from(new Set(items.map((i) => i.role))).map((role) => (
            <div key={role} className="rounded border border-line p-4">
              <div className="flex flex-wrap gap-2">
                {items
                  .filter((i) => i.role === role)
                  .map((i) => (
                    <WordChip key={i.words?.id} word={i.words} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((i) => (
            <div key={i.words?.id} className="rounded border border-line p-3">
              <WordChip word={i.words} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WordChip({
  word,
}: {
  word: { hanzi: string; pinyin: string | null; meaning_ja: string | null } | undefined | null;
}) {
  if (!word) return null;
  return (
    <div className="text-center">
      <p className="text-lg">{word.hanzi}</p>
      <p className="text-xs text-ink-soft">{word.pinyin}</p>
      <p className="text-xs">{word.meaning_ja}</p>
    </div>
  );
}
