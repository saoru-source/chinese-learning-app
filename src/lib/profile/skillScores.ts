import { MASTERY_STAGE } from "@/lib/words/reviewProgress";

export type ProgressRowForSkills = {
  item_type: string;
  correct_count: number;
  incorrect_count: number;
  review_stage: number | null;
};

export type SkillScore = {
  // 記録が1件も無い場合はnull(「データなし」表示用)。0%と紛れないよう分ける。
  percent: number | null;
  correct: number;
  total: number;
};

export type SkillScores = {
  speaking: SkillScore;
  listening: SkillScore;
  reading: SkillScore;
  grammar: SkillScore;
  word: SkillScore;
};

// 「話す」は5画面(単語一覧・段階的暗記・グループ暗記・例文パターン集・会話練習)の
// 発音チェック結果をまとめて1つのスコアにする(item_typeを合算)。
const SPEAKING_ITEM_TYPES = new Set(["word_pronunciation", "pattern_pronunciation", "conversation_line"]);

function aggregate(rows: ProgressRowForSkills[], matches: (row: ProgressRowForSkills) => boolean): SkillScore {
  let correct = 0;
  let total = 0;
  for (const row of rows) {
    if (!matches(row)) continue;
    correct += row.correct_count;
    total += row.correct_count + row.incorrect_count;
  }
  return { correct, total, percent: total > 0 ? Math.round((correct / total) * 100) : null };
}

export function computeSkillScores(rows: ProgressRowForSkills[], totalWordCount: number): SkillScores {
  const speaking = aggregate(rows, (r) => SPEAKING_ITEM_TYPES.has(r.item_type));
  const listening = aggregate(rows, (r) => r.item_type === "listening_question");
  const reading = aggregate(rows, (r) => r.item_type === "reading_question");
  const grammar = aggregate(rows, (r) => r.item_type === "grammar");

  const wordRows = rows.filter((r) => r.item_type === "word");
  const masteredWords = wordRows.filter((r) => (r.review_stage ?? 0) >= MASTERY_STAGE).length;
  const word: SkillScore = {
    correct: masteredWords,
    total: totalWordCount,
    percent: wordRows.length > 0 && totalWordCount > 0 ? Math.round((masteredWords / totalWordCount) * 100) : null,
  };

  return { speaking, listening, reading, grammar, word };
}
