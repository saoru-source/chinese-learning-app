import { SupabaseClient } from "@supabase/supabase-js";

export type StepwiseSentence = {
  id: number;
  hanzi: string;
  pinyin: string | null;
  meaning_ja: string | null;
  hsk_level: number;
  knownWords: string[];
};

type Candidate = {
  id: number;
  hanzi: string;
  pinyin: string | null;
  meaning_ja: string | null;
  hsk_level: number;
};

function scoreCandidate(s: Candidate, knownHanziList: string[]) {
  const matched = knownHanziList.filter((w) => s.hanzi.includes(w));
  if (matched.length === 0) return null;
  // 既習単語のカバー率(文字数ベース)が高いものを優先する
  const coveredChars = new Set(matched.join("")).size;
  const score = matched.length * 10 + coveredChars;
  return { score, matched };
}

// 「段階的暗記モード」(追加コンテンツ仕様②)
// ユーザーが既に正解したことのある単語(=既習語彙)をできるだけ多く含む
// 例文を、1セッションぶん(sessionSize件)まとめて選ぶ。
// 新デザインの導入/進捗/結果画面がセッション単位の件数を必要とするため、
// 元々1件だけを返していたpickStepwiseSentenceをセッション対応に拡張したもの。
// 候補一覧(sentencesテーブル)の取得は1回だけ行い、その中から重複なくsessionSize件を
// 順に選んでいく(選んだ文はstudiedSentenceIdsと同様に以降の選定から除外する)。
export async function pickStepwiseSession(
  supabase: SupabaseClient,
  userId: string,
  sessionSize: number
): Promise<{ sentences: StepwiseSentence[]; knownWordCount: number }> {
  const { data: wordProgress } = await supabase
    .from("progress")
    .select("item_id, correct_count")
    .eq("user_id", userId)
    .eq("item_type", "word")
    .gt("correct_count", 0);

  const learnedWordIds = (wordProgress ?? []).map((p) => p.item_id);

  if (learnedWordIds.length === 0) {
    return { sentences: [], knownWordCount: 0 };
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
  const excludedIds = new Set<number>(
    (sentenceProgress ?? []).map((p) => p.item_id)
  );

  const { data: candidates } = await supabase
    .from("sentences")
    .select("id, hanzi, pinyin, meaning_ja, hsk_level")
    .limit(2000);

  const sentences: StepwiseSentence[] = [];

  for (let picked = 0; picked < sessionSize; picked++) {
    let best: Candidate | null = null;
    let bestMatched: string[] = [];
    let bestScore = -1;

    for (const s of candidates ?? []) {
      if (excludedIds.has(s.id)) continue;
      const result = scoreCandidate(s, knownHanziList);
      if (!result) continue;
      if (result.score > bestScore) {
        bestScore = result.score;
        best = s;
        bestMatched = result.matched;
      }
    }

    if (!best) break;

    excludedIds.add(best.id);
    sentences.push({
      id: best.id,
      hanzi: best.hanzi,
      pinyin: best.pinyin,
      meaning_ja: best.meaning_ja,
      hsk_level: best.hsk_level,
      knownWords: Array.from(new Set(bestMatched)),
    });
  }

  return { sentences, knownWordCount: knownHanziList.length };
}
