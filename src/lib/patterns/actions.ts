"use server";

import { createClient } from "@/lib/supabase/server";

// 例文パターン集(/patterns/[style]/[situation])での発音チェック結果を記録する。
// item_id体系はsentence_patterns.idを使うため、words.id等とは別のitem_type
// (word_pronunciation)ではなく独立したitem_type: 'pattern_pronunciation'とする
// (progressの一意制約は(user_id, item_type, item_id)なので、item_typeを
// 分けている限り数値としてのid重複があっても既存レコードとは衝突しない)。
// 合否基準は会話練習(recordConversationLineResult)・word_pronunciationと同じ60%。
const PASS_THRESHOLD = 60;

export async function recordPatternPronunciationResult(patternId: number, pct: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const correct = pct >= PASS_THRESHOLD;

  const { data: existing } = await supabase
    .from("progress")
    .select("id, correct_count, incorrect_count")
    .eq("user_id", user.id)
    .eq("item_type", "pattern_pronunciation")
    .eq("item_id", patternId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("progress")
      .update({
        correct_count: existing.correct_count + (correct ? 1 : 0),
        incorrect_count: existing.incorrect_count + (correct ? 0 : 1),
        last_studied_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) console.error("recordPatternPronunciationResult (update) failed", error);
  } else {
    const { error } = await supabase.from("progress").insert({
      user_id: user.id,
      item_type: "pattern_pronunciation",
      item_id: patternId,
      correct_count: correct ? 1 : 0,
      incorrect_count: correct ? 0 : 1,
      last_studied_at: new Date().toISOString(),
    });
    if (error) console.error("recordPatternPronunciationResult (insert) failed", error);
  }
}
