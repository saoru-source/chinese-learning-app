import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 30;

export default async function SentencesPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; page?: string }>;
}) {
  const params = await searchParams;
  const level = params.level ? Number(params.level) : null;
  const page = params.page ? Math.max(1, Number(params.page)) : 1;

  const supabase = await createClient();

  let query = supabase
    .from("sentences")
    .select(
      "id, hanzi, pinyin, meaning_ja, explanation_ja, hsk_level, grammar_points(label)",
      { count: "exact" }
    )
    .order("id", { ascending: true })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (level) {
    query = query.eq("hsk_level", level);
  }

  const { data: sentences, count, error } = await query;

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1;

  const levelHref = (lv: number | null) =>
    `/sentences${lv ? `?level=${lv}` : ""}`;
  const pageHref = (p: number) =>
    `/sentences?${level ? `level=${level}&` : ""}page=${p}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">例文一覧</h1>
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
        {[1, 2, 3, 4].map((lv) => (
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

      <ul className="flex flex-col gap-4">
        {sentences?.map((s) => {
          const gp = Array.isArray(s.grammar_points)
            ? s.grammar_points[0]
            : s.grammar_points;
          return (
            <li key={s.id} className="rounded border border-line p-4">
              <div className="flex items-center justify-between text-xs text-ink-soft">
                <span>HSK{s.hsk_level}</span>
                {gp?.label && (
                  <span className="rounded bg-jade/20 px-2 py-0.5 text-ink">
                    {gp.label}
                  </span>
                )}
              </div>
              <p className="mt-1 text-lg">{s.hanzi}</p>
              <p className="text-sm text-ink-soft">{s.pinyin}</p>
              <p className="text-sm">{s.meaning_ja}</p>
              {s.explanation_ja && (
                <p className="mt-1 text-xs text-ink-soft">
                  {s.explanation_ja}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex items-center justify-center gap-4 text-sm">
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
