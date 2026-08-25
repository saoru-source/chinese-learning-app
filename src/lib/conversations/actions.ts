"use server";

import { createClient } from "@/lib/supabase/server";

// クライアント側(ConversationLines)がPronunciationCheckのonResultから直接
// 呼び出す想定のため、recordStepwiseResultと同様フォーム送信ではなく
// 直接引数で呼び出す形にしている。
export async function recordConversationLineResult(lineId: number, correct: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: existing } = await supabase
    .from("progress")
    .select("id, correct_count, incorrect_count")
    .eq("user_id", user.id)
    .eq("item_type", "conversation_line")
    .eq("item_id", lineId)
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
    if (error) console.error("recordConversationLineResult (update) failed", error);
  } else {
    const { error } = await supabase.from("progress").insert({
      user_id: user.id,
      item_type: "conversation_line",
      item_id: lineId,
      correct_count: correct ? 1 : 0,
      incorrect_count: correct ? 0 : 1,
      last_studied_at: new Date().toISOString(),
    });
    if (error) console.error("recordConversationLineResult (insert) failed", error);
  }
}
