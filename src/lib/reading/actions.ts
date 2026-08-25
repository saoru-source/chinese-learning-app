"use server";

import { createClient } from "@/lib/supabase/server";

// 長文読解(/reading/[id])の設問ごとの正誤を記録する。採点自体は
// ReadingQuestions.tsx(クライアント側)がcorrect_choice_indexとの比較で
// 既に行っており、この関数は結果(正誤)を受け取って保存するだけ。
// item_id = passage_questions.id。既存のitem_typeとはid体系が重複し得るが、
// progressの一意制約は(user_id, item_type, item_id)のため、独立した
// item_type: 'reading_question'を新設している限り衝突しない
// (conversation_line/listening_question追加時と同じ考え方)。
export async function recordReadingQuestionResult(questionId: number, correct: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: existing } = await supabase
    .from("progress")
    .select("id, correct_count, incorrect_count")
    .eq("user_id", user.id)
    .eq("item_type", "reading_question")
    .eq("item_id", questionId)
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
    if (error) console.error("recordReadingQuestionResult (update) failed", error);
  } else {
    const { error } = await supabase.from("progress").insert({
      user_id: user.id,
      item_type: "reading_question",
      item_id: questionId,
      correct_count: correct ? 1 : 0,
      incorrect_count: correct ? 0 : 1,
      last_studied_at: new Date().toISOString(),
    });
    if (error) console.error("recordReadingQuestionResult (insert) failed", error);
  }
}
