"use server";

import { createClient } from "@/lib/supabase/server";

const MAX_GOAL_LENGTH = 100;

// テーマ(src/lib/theme/actions.ts)と同じパターン。ホーム画面の目標カードは
// 未ログイン状態でも見た目だけ即時編集できるUIから呼ばれ得るため、
// 未ログイン時はDB保存をスキップするだけでログイン画面へは飛ばさない
// (見た目の編集自体はクライアント側のGoalCardのローカルstateで完結させる)。
export async function setGoalText(goalText: string) {
  const trimmed = goalText.trim().slice(0, MAX_GOAL_LENGTH);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("users")
    .update({ goal_text: trimmed || null })
    .eq("id", user.id);
}
