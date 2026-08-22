"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const VALID_THEMES = ["yebe", "burube", "nordic", "jirai"] as const;

export async function setTheme(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const theme = formData.get("theme") as string;
  if (!VALID_THEMES.includes(theme as (typeof VALID_THEMES)[number])) {
    return;
  }

  // yebe(デフォルト)はdata-theme属性なしで表現するため、DBにはnullで保存する
  await supabase
    .from("users")
    .update({ theme: theme === "yebe" ? null : theme })
    .eq("id", user.id);

  revalidatePath("/", "layout");
}
