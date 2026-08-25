"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function upsertNickname(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const nickname = (formData.get("nickname") as string)?.trim();

  if (!nickname) {
    redirect(`/profile?error=${encodeURIComponent("ニックネームを入力してください。")}`);
  }

  const { error } = await supabase.from("users").upsert(
    {
      id: user.id,
      nickname,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("upsertNickname failed", error);
    const message = error.code === "23505"
      ? "そのニックネームは既に使われています。別の名前にしてください。"
      : `保存に失敗しました: ${error.message}`;
    redirect(`/profile?error=${encodeURIComponent(message)}`);
  }

  redirect("/profile?message=" + encodeURIComponent("ニックネームを保存しました。"));
}
