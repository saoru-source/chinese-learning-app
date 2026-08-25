"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_LEVEL, isLevelKey } from "./levelMeta";

// テーマ切り替え(src/lib/theme/actions.ts)と同じパターン。
// ヘッダーの常設セレクターは未ログイン状態でも見た目だけ即時切り替えられるUIから
// 呼ばれ得るため、未ログイン時はDB保存をスキップするだけでログイン画面へは飛ばさない
// (見た目の切り替え自体はクライアント側のLevelProviderで完結させる)。
export async function setCurrentLevel(level: number) {
  if (!isLevelKey(level)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // DEFAULT_LEVEL(1級)はthemeのyebeと同様、nullで保存する
  const { error } = await supabase
    .from("users")
    .update({ hsk_level: level === DEFAULT_LEVEL ? null : level })
    .eq("id", user.id);
  if (error) console.error("setCurrentLevel failed", error);

  revalidatePath("/", "layout");
}
