import type { SupabaseClient } from "@supabase/supabase-js";
import { sampleWithoutReplacement, shuffle } from "@/lib/milestones/random";
import { computeMilestoneStatus, MILESTONE_HALVES, type MilestoneHalf } from "@/lib/milestones/select";

export const HSK_LEVELS = [1, 2, 3, 4, 5, 6] as const;

// 単語10問+文法10問の固定20問。レベルごとの単語数・文法点数の比率に
// 合わせる案も検討したが、HSK1〜4は文法点数が少なく(9〜12件)比率通りに
// すると文法がほぼ出題されなくなってしまうため、単語・文法を必ず両方
// 一定数出題する固定10問ずつを採用した。
export const WORD_QUESTION_COUNT = 10;
export const GRAMMAR_QUESTION_COUNT = 10;
export const QUESTION_COUNT = WORD_QUESTION_COUNT + GRAMMAR_QUESTION_COUNT;
// 節目テストと同じ8割基準(20問中16問)。
export const PASS_SCORE = 16;

export type GraduationQuestion = {
  kind: "word" | "grammar";
  refId: number;
  prompt: string;
  choices: string[];
  correctIndex: number;
};

// そのHSKレベルの単語卒業試験に先立って、節目テスト(前半/後半)両方に
// 合格済みかどうかを判定する。milestone_attemptsの受験履歴一覧(/milestonesと
// 同じ取得方法)を受け取り、既存のcomputeMilestoneStatusをそのまま使う。
export function isGraduationUnlocked(
  milestoneAttempts: { hsk_level: number; half: MilestoneHalf; passed: boolean }[],
  hskLevel: number,
): boolean {
  return MILESTONE_HALVES.every(
    (half) => computeMilestoneStatus(milestoneAttempts, hskLevel, half) === "passed",
  );
}

// 節目テスト(buildMilestoneQuestions)と同じロジックで4択問題を作る。
// 対象(target)の集合・全体プール(distractor候補)・表示用ラベル・
// 正誤判定用の値、の4つを渡せば単語/文法どちらにも使えるようにしてある。
function buildChoiceQuestions<T extends { id: number }>(
  targets: T[],
  allItems: T[],
  getPrompt: (item: T) => string,
  getAnswer: (item: T) => string,
  kind: GraduationQuestion["kind"],
): GraduationQuestion[] {
  return targets.map((target) => {
    const answer = getAnswer(target);
    const distractorCandidates = allItems.filter(
      (item) => item.id !== target.id && getAnswer(item) !== answer,
    );
    const distractors = sampleWithoutReplacement(distractorCandidates, 3).map(getAnswer);
    const choices = shuffle([answer, ...distractors]);
    return {
      kind,
      refId: target.id,
      prompt: getPrompt(target),
      choices,
      correctIndex: choices.indexOf(answer),
    };
  });
}

// 卒業試験1回ぶん(最大QUESTION_COUNT問)を毎回ランダムに生成する。
// 単語はhanzi→意味の4択(節目テストと同じ)、文法はlabel(文法パターン名)→
// explanation(用法説明)の4択(AIを使わず、grammar_pointsのデータから
// 機械的に作成)。両方をまとめてシャッフルし、単語問題・文法問題が
// ランダムな順で出題されるようにする。
export async function buildGraduationQuestions(
  supabase: SupabaseClient,
  hskLevel: number,
): Promise<GraduationQuestion[]> {
  const [{ data: wordData }, { data: grammarData }] = await Promise.all([
    supabase
      .from("words")
      .select("id, hanzi, meaning_ja")
      .eq("hsk_level", hskLevel)
      .not("meaning_ja", "is", null),
    supabase
      .from("grammar_points")
      .select("id, label, explanation")
      .eq("hsk_level", hskLevel)
      .not("explanation", "is", null),
  ]);

  const allWords = wordData ?? [];
  const allGrammar = grammarData ?? [];

  const wordTargets = sampleWithoutReplacement(allWords, Math.min(WORD_QUESTION_COUNT, allWords.length));
  const grammarTargets = sampleWithoutReplacement(
    allGrammar,
    Math.min(GRAMMAR_QUESTION_COUNT, allGrammar.length),
  );

  const wordQuestions = buildChoiceQuestions(
    wordTargets,
    allWords,
    (w) => w.hanzi,
    (w) => w.meaning_ja as string,
    "word",
  );
  const grammarQuestions = buildChoiceQuestions(
    grammarTargets,
    allGrammar,
    (g) => g.label,
    (g) => g.explanation as string,
    "grammar",
  );

  return shuffle([...wordQuestions, ...grammarQuestions]);
}

export type GraduationStatus = "passed" | "attempted" | "none";

// 卒業試験の受験履歴からステータスを判定する(節目テストのcomputeMilestoneStatus
// と同じ考え方。half が無い分シンプル)。
export function computeGraduationStatus(
  attempts: { hsk_level: number; passed: boolean }[],
  hskLevel: number,
): GraduationStatus {
  const matching = attempts.filter((a) => a.hsk_level === hskLevel);
  if (matching.length === 0) return "none";
  return matching.some((a) => a.passed) ? "passed" : "attempted";
}
