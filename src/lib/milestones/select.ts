import type { SupabaseClient } from "@supabase/supabase-js";
import { sampleWithoutReplacement, shuffle } from "./random";

export type MilestoneHalf = "first" | "second";

export const HSK_LEVELS = [1, 2, 3, 4, 5, 6] as const;
export const MILESTONE_HALVES: MilestoneHalf[] = ["first", "second"];

export const QUESTION_COUNT = 10;
export const PASS_SCORE = 8;

export type MilestoneQuestion = {
  wordId: number;
  hanzi: string;
  choices: string[];
  correctIndex: number;
};

// そのHSKレベルの単語をid順(安定した順序)に前半/後半へ機械的に2分割する。
// 件数が奇数の場合は前半にceil(n/2)件、後半にfloor(n/2)件を割り当てる。
function splitPool<T>(all: T[], half: MilestoneHalf): T[] {
  const splitAt = Math.ceil(all.length / 2);
  return half === "first" ? all.slice(0, splitAt) : all.slice(splitAt);
}

// 節目テスト1回ぶん(QUESTION_COUNT問)の4択問題を毎回ランダムに生成する。
// 正解はその節目の単語プール(前半/後半)から、誤答の選択肢は同じHSK
// レベルの他の単語の意味から(プール外も含む)ランダムに選ぶ。
export async function buildMilestoneQuestions(
  supabase: SupabaseClient,
  hskLevel: number,
  half: MilestoneHalf,
): Promise<MilestoneQuestion[]> {
  const { data } = await supabase
    .from("words")
    .select("id, hanzi, meaning_ja")
    .eq("hsk_level", hskLevel)
    .not("meaning_ja", "is", null)
    .order("id", { ascending: true });

  const allWords = data ?? [];
  if (allWords.length === 0) return [];

  const pool = splitPool(allWords, half);
  const targets = sampleWithoutReplacement(pool, Math.min(QUESTION_COUNT, pool.length));

  return targets.map((target) => {
    const distractorCandidates = allWords.filter(
      (w) => w.id !== target.id && w.meaning_ja !== target.meaning_ja,
    );
    const distractors = sampleWithoutReplacement(distractorCandidates, 3).map(
      (w) => w.meaning_ja as string,
    );
    const choices = shuffle([target.meaning_ja as string, ...distractors]);
    return {
      wordId: target.id,
      hanzi: target.hanzi,
      choices,
      correctIndex: choices.indexOf(target.meaning_ja as string),
    };
  });
}

export type MilestoneStatus = "passed" | "attempted" | "none";

// user_idを指定するとその節目の受験履歴からステータスを判定する
// (passed=trueの行が1件でもあれば"passed"、無いが挑戦履歴があれば
// "attempted"、無ければ"none")。一覧画面で使う。
export function computeMilestoneStatus(
  attempts: { hsk_level: number; half: MilestoneHalf; passed: boolean }[],
  hskLevel: number,
  half: MilestoneHalf,
): MilestoneStatus {
  const matching = attempts.filter((a) => a.hsk_level === hskLevel && a.half === half);
  if (matching.length === 0) return "none";
  return matching.some((a) => a.passed) ? "passed" : "attempted";
}
