import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 50;

export default async function WordsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; page?: string }>;
}) {
  const params = await searchParams;
  const level = params.level ? Number(params.level) : null;
  const page = params.page ? Math.max(1, Number(params.page)) : 1;

  const supabase = await createClient();

  let query = supabase
    .from("words")
    .select("id, hanzi, pinyin, meaning_ja, hsk_level", { count: "exact" })
    .order("id", { ascending: true })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (level) {
    query = query.eq("hsk_level", level);
  }

  const { data: words, count, error } = await query;

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;

  const levelHref = (lv: number | null) =>
    `/words${lv ? `?level=${lv}` : ""}`;
  const pageHref = (p: number) =>
    `/words?${level ? `level=${level}&` : ""}page=${p}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">単語一覧</h1>
        <Link href="/" className="text-sm underline">
          トップに戻る
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link
          href={levelHref(null)}
          className={`rounded border border-line px-3 py-1 ${!level ? "bg-seal text-ink border-seal" : ""}`}
        >
          すべて
        </Link>
        {[1, 2, 3, 4, 5, 6].map((lv) => (
          <Link
            key={lv}
            href={levelHref(lv)}
            className={`rounded border border-line px-3 py-1 ${level === lv ? "bg-seal text-ink border-seal" : ""}`}
          >
            HSK{lv}
          </Link>
        ))}
      </div>

      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">
          データの取得に失敗しました: {error.message}
        </p>
      )}

      <p className="mb-2 text-sm text-ink-soft">
        全{count ?? 0}件中 {(page - 1) * PAGE_SIZE + 1}〜
        {Math.min(page * PAGE_SIZE, count ?? 0)}件を表示
      </p>

      <div className="overflow-x-auto rounded border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-paper-deep text-left">
              <th className="px-3 py-2">漢字</th>
              <th className="px-3 py-2">拼音</th>
              <th className="px-3 py-2">意味</th>
              <th className="px-3 py-2">級</th>
            </tr>
          </thead>
          <tbody>
            {words?.map((w) => (
              <tr key={w.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2">{w.hanzi}</td>
                <td className="px-3 py-2 text-ink-soft">{w.pinyin}</td>
                <td className="px-3 py-2">{w.meaning_ja}</td>
                <td className="px-3 py-2">HSK{w.hsk_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        {page > 1 ? (
          <Link href={pageHref(page - 1)} className="underline">
            前へ
          </Link>
        ) : (
          <span className="text-ink-soft/40">前へ</span>
        )}
        <span>
          {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={pageHref(page + 1)} className="underline">
            次へ
          </Link>
        ) : (
          <span className="text-ink-soft/40">次へ</span>
        )}
      </div>
    </div>
  );
}
