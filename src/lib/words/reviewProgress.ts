import { SupabaseClient } from "@supabase/supabase-js";

// 単語学習の間隔反復(spaced repetition)。正解するたびに段階が1つ進み、
// 対応する日数だけ先が次回の復習予定日になる。REVIEW_INTERVAL_DAYS[n]は
// 「段階n+1に到達した時」の復習間隔(日数)を表す
// (段階1→1日後、段階2→3日後、段階3→7日後、段階4→14日後、段階5→30日後)。
const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30];

// 最終段階(=マスター済みとみなす段階)。1〜2回正解しただけの段階1・2は
// マスター済みではなく、REVIEW_INTERVAL_DAYSの最後(段階5)まで到達して
// 初めてマスター済みとする。
export const MASTERY_STAGE = REVIEW_INTERVAL_DAYS.length;

// 単語1つぶんの正誤結果を記録し、間隔反復の状態(review_stage/next_review_at)を
// 更新する。/quiz/ai(recordAiSentenceResult)と/quiz(recordAnswer)の両方の
// 単語出題経路から呼ばれる想定。
//
// 不正解時はAnkiのライトナーボックス方式と同様、段階を最初(0)に戻し、
// 次回復習をすぐ(現在時刻)に設定する。1回間違えただけでもマスター済み
// 扱いを解除する(「本当に覚えたか」を厳しく判定したいというユーザーの
// 要望に沿った設計)。
export async function recordWordReviewResult(
  supabase: SupabaseClient,
  userId: string,
  wordId: number,
  correct: boolean
) {
  const { data: existing } = await supabase
    .from("progress")
    .select("id, correct_count, incorrect_count, review_stage")
    .eq("user_id", userId)
    .eq("item_type", "word")
    .eq("item_id", wordId)
    .maybeSingle();

  const currentStage: number = existing?.review_stage ?? 0;
  const nextStage = correct ? Math.min(currentStage + 1, MASTERY_STAGE) : 0;
  const nextReviewAt = correct
    ? new Date(Date.now() + REVIEW_INTERVAL_DAYS[nextStage - 1] * 24 * 60 * 60 * 1000).toISOString()
    : new Date().toISOString();

  if (existing) {
    const { error } = await supabase
      .from("progress")
      .update({
        correct_count: existing.correct_count + (correct ? 1 : 0),
        incorrect_count: existing.incorrect_count + (correct ? 0 : 1),
        review_stage: nextStage,
        next_review_at: nextReviewAt,
        last_studied_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) console.error("recordWordReviewResult (update) failed", error);
  } else {
    const { error } = await supabase.from("progress").insert({
      user_id: userId,
      item_type: "word",
      item_id: wordId,
      correct_count: correct ? 1 : 0,
      incorrect_count: correct ? 0 : 1,
      review_stage: nextStage,
      next_review_at: nextReviewAt,
      last_studied_at: new Date().toISOString(),
    });
    if (error) console.error("recordWordReviewResult (insert) failed", error);
  }
}
