"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isThemeKey } from "./themeMeta";

// クライアント側から直接呼び出せるテーマ保存処理。
// ヘッダーのテーマドット等、未ログイン状態でも見た目だけ即時切り替えられるUIから
// 呼ばれ得るため、未ログイン時はDB保存をスキップするだけで、ログイン画面へは飛ばさない
// (見た目の切り替え自体はクライアント側のThemeProviderがdata-theme属性で完結させる)。
export async function setThemeValue(theme: string) {
  if (!isThemeKey(theme)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // yebe(デフォルト)はdata-theme属性なしで表現するため、DBにはnullで保存する
  await supabase
    .from("users")
    .update({ theme: theme === "yebe" ? null : theme })
    .eq("id", user.id);

  revalidatePath("/", "layout");
}

// /profile のテーマ切り替えUIが<form action={...}>経由で呼ぶ薄いラッパー
export async function setTheme(formData: FormData) {
  const theme = formData.get("theme") as string;
  await setThemeValue(theme);
}
