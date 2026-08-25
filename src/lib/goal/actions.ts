"use server";

import { createClient } from "@/lib/supabase/server";

const MAX_GOAL_LENGTH = 100;

// テーマ(src/lib/theme/actions.ts)と同じパターン。ホーム画面の目標カードは
// 未ログイン状態でも見た目だけ即時編集できるUIから呼ばれ得るため、
// 未ログイン時はDB保存をスキップするだけでログイン画面へは飛ばさない
// (見た目の編集自体はクライアント側のGoalCardのローカルstateで完結させる)。
//
// goal_textは本人専用のuser_goalsテーブルに保存する(RLS監査(2026-08-25)で
// usersテーブルの「ログイン中なら誰でも閲覧可」ポリシーに巻き込まれ、
// 他人の目標メモが読めてしまう状態だったため分離した)。
export async function setGoalText(goalText: string) {
  const trimmed = goalText.trim().slice(0, MAX_GOAL_LENGTH);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("user_goals")
    .upsert(
      { user_id: user.id, goal_text: trimmed || null, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  if (error) console.error("setGoalText failed", error);
}
