"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function recordStepwiseResult(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const itemId = Number(formData.get("itemId"));
  const correct = formData.get("correct") === "true";

  const { data: existing } = await supabase
    .from("progress")
    .select("id, correct_count, incorrect_count")
    .eq("user_id", user.id)
    .eq("item_type", "sentence")
    .eq("item_id", itemId)
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
      item_type: "sentence",
      item_id: itemId,
      correct_count: correct ? 1 : 0,
      incorrect_count: correct ? 0 : 1,
      last_studied_at: new Date().toISOString(),
    });
  }

  redirect("/study");
}
