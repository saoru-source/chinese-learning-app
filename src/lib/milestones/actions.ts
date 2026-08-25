"use server";

import { createClient } from "@/lib/supabase/server";
import { PASS_SCORE, type MilestoneHalf } from "./select";

export async function recordMilestoneAttempt(
  hskLevel: number,
  half: MilestoneHalf,
  score: number,
  totalQuestions: number,
): Promise<{ passed: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const passed = score >= PASS_SCORE;
  if (!user) return { passed };

  const { error } = await supabase.from("milestone_attempts").insert({
    user_id: user.id,
    hsk_level: hskLevel,
    half,
    score,
    total_questions: totalQuestions,
    passed,
  });
  if (error) console.error("recordMilestoneAttempt failed", error);

  return { passed };
}
