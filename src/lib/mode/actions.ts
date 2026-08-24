"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isModeKey } from "./modeMeta";

// テーマ切り替え(src/lib/theme/actions.ts)と同じパターン。ヘッダーのライト/ダーク
// トグルは未ログイン状態でも見た目だけ即時切り替えられるUIから呼ばれ得るため、
// 未ログイン時はDB保存をスキップするだけで、ログイン画面へは飛ばさない
// (見た目の切り替え自体はクライアント側のModeProviderがdata-mode属性で完結させる)。
export async function setModeValue(mode: string) {
  if (!isModeKey(mode)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("users")
    .update({ dark_mode: mode === "dark" })
    .eq("id", user.id);

  revalidatePath("/", "layout");
}
