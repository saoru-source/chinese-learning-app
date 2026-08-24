import { SupabaseClient } from "@supabase/supabase-js";

export type QuizWord = {
  id: number;
  hanzi: string;
  pinyin: string | null;
  meaning_ja: string | null;
  hsk_level: number | null;
  word_type: string | null;
};

// 進捗データを見て、優先的に出題する単語を1つ選ぶ。
// 1. 不正解が正解以上の「苦手な単語」があればそこから
// 2. なければまだ学習していない「新出単語」から
// 3. それもなければ、全体からランダムに復習
export async function pickNextWord(
  supabase: SupabaseClient,
  userId: string
): Promise<QuizWord | null> {
  const { data: weakProgress } = await supabase
    .from("progress")
    .select("item_id, correct_count, incorrect_count")
    .eq("user_id", userId)
    .eq("item_type", "word")
    .order("incorrect_count", { ascending: false })
    .limit(200);

  const weakIds =
    weakProgress
      ?.filter((p) => p.incorrect_count >= p.correct_count)
      .map((p) => p.item_id) ?? [];

  if (weakIds.length > 0) {
    const pickId = weakIds[Math.floor(Math.random() * weakIds.length)];
    const { data } = await supabase
      .from("words")
      .select("id, hanzi, pinyin, meaning_ja, hsk_level, word_type")
      .eq("id", pickId)
      .single();
    if (data) return data;
  }

  const studiedIds = weakProgress?.map((p) => p.item_id) ?? [];
  const { data: allProgress } = await supabase
    .from("progress")
    .select("item_id")
    .eq("user_id", userId)
    .eq("item_type", "word");
  const allStudiedIds = allProgress?.map((p) => p.item_id) ?? studiedIds;

  const { count } = await supabase
    .from("words")
    .select("id", { count: "exact", head: true });
  const total = count ?? 0;
  if (total === 0) return null;

  const randomOffset = Math.floor(Math.random() * total);

  let newWordQuery = supabase
    .from("words")
    .select("id, hanzi, pinyin, meaning_ja, hsk_level, word_type")
    .order("id", { ascending: true })
    .range(randomOffset, randomOffset);

  if (allStudiedIds.length > 0) {
    newWordQuery = supabase
      .from("words")
      .select("id, hanzi, pinyin, meaning_ja, hsk_level, word_type")
      .not("id", "in", `(${allStudiedIds.join(",")})`)
      .order("id", { ascending: true })
      .limit(1);
  }

  const { data: candidate } = await newWordQuery;
  if (candidate && candidate.length > 0) {
    return candidate[0];
  }

  // 新出単語がなければ(全部学習済み)、全体からランダムに復習
  const { data: reviewCandidate } = await supabase
    .from("words")
    .select("id, hanzi, pinyin, meaning_ja, hsk_level, word_type")
    .order("id", { ascending: true })
    .range(randomOffset, randomOffset);

  return reviewCandidate?.[0] ?? null;
}

// AI例文生成の材料にする「苦手な単語」を最大limit件取得する。
// 苦手な単語が足りない場合は、まだ学習していない単語で補う。
// levelを渡すと、その単語自体をHSKレベルで絞り込む
// (「苦手」の判定自体はレベルを跨いだprogress全体から行うが、
// 実際にAIへの材料として使うのは指定レベルの単語だけ)。
export async function getWeakWords(
  supabase: SupabaseClient,
  userId: string,
  level: number,
  limit = 3
): Promise<QuizWord[]> {
  const { data: progressRows } = await supabase
    .from("progress")
    .select("item_id, correct_count, incorrect_count")
    .eq("user_id", userId)
    .eq("item_type", "word");

  const weakIds = (progressRows ?? [])
    .filter((p) => p.incorrect_count >= p.correct_count)
    .sort((a, b) => b.incorrect_count - b.correct_count - (a.incorrect_count - a.correct_count))
    .slice(0, limit)
    .map((p) => p.item_id);

  const result: QuizWord[] = [];

  if (weakIds.length > 0) {
    const { data } = await supabase
      .from("words")
      .select("id, hanzi, pinyin, meaning_ja, hsk_level, word_type")
      .eq("hsk_level", level)
      .in("id", weakIds);
    if (data) result.push(...data);
  }

  if (result.length < limit) {
    const studiedIds = (progressRows ?? []).map((p) => p.item_id);
    let fillerQuery = supabase
      .from("words")
      .select("id, hanzi, pinyin, meaning_ja, hsk_level, word_type")
      .eq("hsk_level", level)
      .order("id", { ascending: true })
      .limit(limit - result.length);

    if (studiedIds.length > 0) {
      fillerQuery = fillerQuery.not("id", "in", `(${studiedIds.join(",")})`);
    }

    const { data: filler } = await fillerQuery;
    if (filler) result.push(...filler);
  }

  return result;
}

export type QuizGrammarPoint = {
  id: number;
  hsk_level: number | null;
  label: string;
  explanation: string | null;
};

// AI文法出題の材料にする「苦手な文法点」を最大limit件取得する。
// getWeakWordsと同じ考え方: 苦手な文法点(不正解数が正解数以上)が足りない
// 場合は、まだ学習していない文法点で補う。levelでの絞り込みも同様。
export async function getWeakGrammarPoints(
  supabase: SupabaseClient,
  userId: string,
  level: number,
  limit = 1
): Promise<QuizGrammarPoint[]> {
  const { data: progressRows } = await supabase
    .from("progress")
    .select("item_id, correct_count, incorrect_count")
    .eq("user_id", userId)
    .eq("item_type", "grammar");

  const weakIds = (progressRows ?? [])
    .filter((p) => p.incorrect_count >= p.correct_count)
    .sort((a, b) => b.incorrect_count - b.correct_count - (a.incorrect_count - a.correct_count))
    .slice(0, limit)
    .map((p) => p.item_id);

  const result: QuizGrammarPoint[] = [];

  if (weakIds.length > 0) {
    const { data } = await supabase
      .from("grammar_points")
      .select("id, hsk_level, label, explanation")
      .eq("hsk_level", level)
      .in("id", weakIds);
    if (data) result.push(...data);
  }

  if (result.length < limit) {
    const studiedIds = (progressRows ?? []).map((p) => p.item_id);
    let fillerQuery = supabase
      .from("grammar_points")
      .select("id, hsk_level, label, explanation")
      .eq("hsk_level", level)
      .order("id", { ascending: true })
      .limit(limit - result.length);

    if (studiedIds.length > 0) {
      fillerQuery = fillerQuery.not("id", "in", `(${studiedIds.join(",")})`);
    }

    const { data: filler } = await fillerQuery;
    if (filler) result.push(...filler);
  }

  return result;
}
