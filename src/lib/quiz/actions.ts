"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { recordWordReviewResult } from "@/lib/words/reviewProgress";

export async function recordAnswer(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const itemId = Number(formData.get("itemId"));
  const correct = formData.get("correct") === "true";

  await recordWordReviewResult(supabase, user.id, itemId, correct);

  redirect("/quiz");
}
