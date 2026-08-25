"use server";

import { createClient } from "@/lib/supabase/server";

// 発音チェック(PronunciationCheck)の一致度をここで合否判定して記録する。
// item_type: 'word_pronunciation'は、間隔反復・苦手優先選択の対象である
// 既存のitem_type: 'word'(reviewProgress.ts)とは完全に別の記録であり、
// review_stage等には一切触れない(マイページの「話す」スコア集計専用)。
// 単語一覧(/words)・段階的暗記(/study)・グループ暗記(/groups/[id])の
// いずれもwordIdをbindしてPronunciationCheckのonResultにそのまま渡す想定のため、
// 引数はitem_id(wordId)と一致度(pct)のみとし、合否判定はこの関数の中で行う。
const PASS_THRESHOLD = 60;

export async function recordWordPronunciationResult(wordId: number, pct: number) {
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
    .eq("item_type", "word_pronunciation")
    .eq("item_id", wordId)
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
    if (error) console.error("recordWordPronunciationResult (update) failed", error);
  } else {
    const { error } = await supabase.from("progress").insert({
      user_id: user.id,
      item_type: "word_pronunciation",
      item_id: wordId,
      correct_count: correct ? 1 : 0,
      incorrect_count: correct ? 0 : 1,
      last_studied_at: new Date().toISOString(),
    });
    if (error) console.error("recordWordPronunciationResult (insert) failed", error);
  }
}
