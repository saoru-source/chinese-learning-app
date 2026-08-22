import { SupabaseClient } from "@supabase/supabase-js";

export type StepwiseSentence = {
  id: number;
  hanzi: string;
  pinyin: string | null;
  meaning_ja: string | null;
  hsk_level: number;
  knownWords: string[];
};

// 「段階的暗記モード」(追加コンテンツ仕様②)
// ユーザーが既に正解したことのある単語(=既習語彙)をできるだけ多く含む
// 例文を優先的に出題する。新出単語(未習語彙)は少数だけ混ざる形になる。
export async function pickStepwiseSentence(
  supabase: SupabaseClient,
  userId: string
): Promise<{ sentence: StepwiseSentence | null; knownWordCount: number }> {
  const { data: wordProgress } = await supabase
    .from("progress")
    .select("item_id, correct_count")
    .eq("user_id", userId)
    .eq("item_type", "word")
    .gt("correct_count", 0);

  const learnedWordIds = (wordProgress ?? []).map((p) => p.item_id);

  if (learnedWordIds.length === 0) {
    return { sentence: null, knownWordCount: 0 };
  }

  const { data: learnedWords } = await supabase
    .from("words")
    .select("hanzi")
    .in("id", learnedWordIds);

  const knownHanziList = (learnedWords ?? [])
    .map((w) => w.hanzi)
    .filter((h) => h && h.length >= 1)
    // 1文字語は例文中にほぼ必ず含まれてしまい判定精度が落ちるため、
    // 2文字以上の単語を優先的に判定材料にする
    .sort((a, b) => b.length - a.length);

  const { data: sentenceProgress } = await supabase
    .from("progress")
    .select("item_id")
    .eq("user_id", userId)
    .eq("item_type", "sentence");
  const studiedSentenceIds = new Set(
    (sentenceProgress ?? []).map((p) => p.item_id)
  );

  const { data: candidates } = await supabase
    .from("sentences")
    .select("id, hanzi, pinyin, meaning_ja, hsk_level")
    .limit(2000);

  let best: StepwiseSentence | null = null;
  let bestScore = -1;

  for (const s of candidates ?? []) {
    if (studiedSentenceIds.has(s.id)) continue;
    const matched = knownHanziList.filter((w) => s.hanzi.includes(w));
    if (matched.length === 0) continue;
    // 既習単語のカバー率(文字数ベース)が高いものを優先する
    const coveredChars = new Set(matched.join("")).size;
    const score = matched.length * 10 + coveredChars;
    if (score > bestScore) {
      bestScore = score;
      best = {
        id: s.id,
        hanzi: s.hanzi,
        pinyin: s.pinyin,
        meaning_ja: s.meaning_ja,
        hsk_level: s.hsk_level,
        knownWords: Array.from(new Set(matched)),
      };
    }
  }

  return { sentence: best, knownWordCount: knownHanziList.length };
}
