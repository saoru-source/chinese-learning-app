"use server";

import { createClient } from "@/lib/supabase/server";
import { PASS_SCORE } from "./select";

export async function recordGraduationAttempt(
  hskLevel: number,
  score: number,
  totalQuestions: number,
): Promise<{ passed: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const passed = score >= PASS_SCORE;
  if (!user) return { passed };

  const { error } = await supabase.from("graduation_attempts").insert({
    user_id: user.id,
    hsk_level: hskLevel,
    score,
    total_questions: totalQuestions,
    passed,
  });
  if (error) console.error("recordGraduationAttempt failed", error);

  return { passed };
}
