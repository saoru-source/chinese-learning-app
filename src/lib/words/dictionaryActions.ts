"use server";

import { createClient } from "@/lib/supabase/server";

export type DictionaryWord = {
  id: number;
  hanzi: string;
  pinyin: string | null;
  meaning_ja: string | null;
  studied: boolean;
};

export type DictionaryPageResult = {
  items: DictionaryWord[];
  total: number;
  pageSize: number;
};

export type SortMode = "level" | "pinyin" | "studied";

const PAGE_SIZE = 60;

// Supabase(PostgREST)は1リクエストあたり暗黙のデフォルト上限(1,000件)を
// 持っており、.range()で明示的にそれを超える範囲を指定しても実際には
// 1,000件で打ち切られる(HSK6の1,082件で実際に踏んだ)。「全件取得」が
// 必要な箇所ではこのチャンクサイズで区切って繰り返し取得する。
const MAX_ROWS_PER_REQUEST = 1000;

type WordRow = { id: number; hanzi: string; pinyin: string | null; meaning_ja: string | null };

async function fetchAllWords(
  supabase: Awaited<ReturnType<typeof createClient>>,
  level: number,
): Promise<WordRow[]> {
  const all: WordRow[] = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from("words")
      .select("id, hanzi, pinyin, meaning_ja")
      .eq("hsk_level", level)
      .order("id", { ascending: true })
      .range(offset, offset + MAX_ROWS_PER_REQUEST - 1);

    const chunk = data ?? [];
    all.push(...chunk);
    if (chunk.length < MAX_ROWS_PER_REQUEST) break;
    offset += MAX_ROWS_PER_REQUEST;
  }
  return all;
}

async function getStudiedIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  wordIds: number[],
): Promise<Set<number>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || wordIds.length === 0) return new Set();

  const studiedIds = new Set<number>();
  // wordIdsが1,000件を超える場合(HSK6等)、.in()フィルタの一致件数自体が
  // MAX_ROWS_PER_REQUESTを超えうるため、対象のwordIdsをチャンクに分けて
  // 問い合わせる(fetchAllWordsと同じ理由)。
  for (let i = 0; i < wordIds.length; i += MAX_ROWS_PER_REQUEST) {
    const chunkIds = wordIds.slice(i, i + MAX_ROWS_PER_REQUEST);
    const { data: progressRows } = await supabase
      .from("progress")
      .select("item_id")
      .eq("user_id", user.id)
      .eq("item_type", "word")
      .in("item_id", chunkIds)
      .range(0, chunkIds.length - 1);

    for (const row of progressRows ?? []) {
      studiedIds.add(row.item_id as number);
    }
  }

  return studiedIds;
}

// 学習済み・未学習で分ける並び替えは、ページ単位取得のままだと正しく分けられない
// (学習済み判定がそのページに含まれる単語だけを見て行われるため)。該当レベルの
// 全単語+全学習進捗を一度取得してから未学習/学習済みに振り分けて結合し、
// その結果をページ単位に切り出す(最大でも1レベル1,082件程度のため許容範囲)。
async function getWordDictionaryPageByStudied(
  supabase: Awaited<ReturnType<typeof createClient>>,
  level: number,
  page: number,
): Promise<DictionaryPageResult> {
  const words = await fetchAllWords(supabase, level);
  const total = words.length;
  const studiedIds = await getStudiedIds(
    supabase,
    words.map((w) => w.id),
  );

  const unstudied = words.filter((w) => !studiedIds.has(w.id));
  const studied = words.filter((w) => studiedIds.has(w.id));
  const ordered = [...unstudied, ...studied];

  const from = Math.max(0, (page - 1) * PAGE_SIZE);
  const pageWords = ordered.slice(from, from + PAGE_SIZE);

  const items: DictionaryWord[] = pageWords.map((w) => ({
    id: w.id,
    hanzi: w.hanzi,
    pinyin: w.pinyin,
    meaning_ja: w.meaning_ja,
    studied: studiedIds.has(w.id),
  }));

  return { items, total, pageSize: PAGE_SIZE };
}

// 単語辞書(/learn/dictionary)用。件数が多い(最大1,082件)ため、レベル×並び替え
// ×ページ単位で必要な分だけ取得する(「学習済み・未学習で分ける」を除く)。
// 「学習済み」判定は、そのページに含まれる単語IDだけを絞ってprogressテーブル
// (item_type="word")に行があるかどうかで行う(全件の学習状況を一括取得しない
// = パフォーマンス配慮)。
export async function getWordDictionaryPage(
  level: number,
  page: number,
  sortMode: SortMode = "level",
): Promise<DictionaryPageResult> {
  const supabase = await createClient();

  if (sortMode === "studied") {
    return getWordDictionaryPageByStudied(supabase, level, page);
  }

  const { count } = await supabase
    .from("words")
    .select("id", { count: "exact", head: true })
    .eq("hsk_level", level);

  const total = count ?? 0;
  const from = Math.max(0, (page - 1) * PAGE_SIZE);
  const to = from + PAGE_SIZE - 1;

  const query = supabase.from("words").select("id, hanzi, pinyin, meaning_ja").eq("hsk_level", level);
  const orderedQuery =
    sortMode === "pinyin"
      ? query.order("pinyin", { ascending: true })
      : query.order("id", { ascending: true });

  const { data: words } = await orderedQuery.range(from, to);

  const wordIds = (words ?? []).map((w) => w.id);
  const studiedIds = await getStudiedIds(supabase, wordIds);

  const items: DictionaryWord[] = (words ?? []).map((w) => ({
    id: w.id,
    hanzi: w.hanzi,
    pinyin: w.pinyin,
    meaning_ja: w.meaning_ja,
    studied: studiedIds.has(w.id),
  }));

  return { items, total, pageSize: PAGE_SIZE };
}
