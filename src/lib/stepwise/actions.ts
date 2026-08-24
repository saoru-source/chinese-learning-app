"use server";

import { createClient } from "@/lib/supabase/server";
import { recordWordReviewResult } from "@/lib/words/reviewProgress";

// 段階的暗記(/study)の4段階(見る→思い出す→発音する→使う)を完了した単語を
// 「覚えた」として記録する。間隔反復システム(recordWordReviewResult)の
// 「正解」時と同じ扱いにすることで、review_stageを0→1に進め次回復習日を
// 設定し、以降は/wordsや/quizの通常の復習サイクルに合流させる。
export async function recordNewWordLearned(wordId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await recordWordReviewResult(supabase, user.id, wordId, true);
}
