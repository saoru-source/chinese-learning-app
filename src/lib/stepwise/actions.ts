"use server";

import { createClient } from "@/lib/supabase/server";

// クライアント側(StudySession)がセッション内で順番に呼び出す想定のため、
// フォーム送信ではなく直接引数で呼び出す形にしている(呼び出し後に画面遷移は
// 行わず、セッションの進行はクライアント側のstateで管理する)。
export async function recordStepwiseResult(itemId: number, correct: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: existing } = await supabase
    .from("progress")
    .select("id, correct_count, incorrect_count")
    .eq("user_id", user.id)
    .eq("item_type", "sentence")
    .eq("item_id", itemId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("progress")
      .update({
        correct_count: existing.correct_count + (correct ? 1 : 0),
        incorrect_count: existing.incorrect_count + (correct ? 0 : 1),
        last_studied_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("progress").insert({
      user_id: user.id,
      item_type: "sentence",
      item_id: itemId,
      correct_count: correct ? 1 : 0,
      incorrect_count: correct ? 0 : 1,
      last_studied_at: new Date().toISOString(),
    });
  }
}
