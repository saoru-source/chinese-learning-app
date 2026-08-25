"use server";

import { createClient } from "@/lib/supabase/server";

// 選択式(ListeningChoiceCard)・ディクテーション(DictationCard)いずれも
// クライアント側で正誤(または一致率からの合否)を判定した直後に直接呼び出す想定のため、
// recordConversationLineResultと同様フォーム送信ではなく引数で呼び出す形にしている。
// questionIdはlistening_questions.id(choice/dictation両モードを通じて一意)。
export async function recordListeningResult(questionId: number, correct: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: existing } = await supabase
    .from("progress")
    .select("id, correct_count, incorrect_count")
    .eq("user_id", user.id)
    .eq("item_type", "listening_question")
    .eq("item_id", questionId)
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
      item_type: "listening_question",
      item_id: questionId,
      correct_count: correct ? 1 : 0,
      incorrect_count: correct ? 0 : 1,
      last_studied_at: new Date().toISOString(),
    });
  }
}
