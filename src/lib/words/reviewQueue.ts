import { SupabaseClient } from "@supabase/supabase-js";

// /words(単語一覧)の出題順序を、間隔反復(spaced repetition)の復習予定日
// (next_review_at)に基づいて並び替える。優先順位は以下の3段階:
// 1. 復習予定日が来ている単語(next_review_at <= 現在時刻)。予定日が早い順。
// 2. まだ一度もクイズに正誤判定を受けていない単語(next_review_at未設定)。
//    id順(既存の挙動に近いフォールバック)。
// 3. まだ復習時期でない単語。予定日が近い順(全て消化した場合の最終フォールバック、
//    /wordsは全件をprev/nextでブラウズできる設計を維持するため、除外はしない)。
//
// 「/wordsで見ただけ(クイズに答えていない)」場合はprogress行自体は存在するが
// next_review_atはnull(未設定)のままなので、これは正しく2の「未学習」扱いになる
// (progress行の有無ではなくnext_review_atの値そのもので判定するため)。
export async function getWordReviewOrder(
  supabase: SupabaseClient,
  userId: string | null,
  level: number
): Promise<number[]> {
  const { data: words } = await supabase
    .from("words")
    .select("id")
    .eq("hsk_level", level)
    .order("id", { ascending: true });

  const allIds = (words ?? []).map((w) => w.id as number);
  if (!userId || allIds.length === 0) return allIds;

  const { data: progressRows } = await supabase
    .from("progress")
    .select("item_id, next_review_at")
    .eq("user_id", userId)
    .eq("item_type", "word")
    .in("item_id", allIds);

  const nextReviewMap = new Map<number, string | null>();
  for (const row of progressRows ?? []) {
    nextReviewMap.set(row.item_id as number, row.next_review_at as string | null);
  }

  const now = Date.now();
  const due: { id: number; at: number }[] = [];
  const neverReviewed: number[] = [];
  const notYetDue: { id: number; at: number }[] = [];

  for (const id of allIds) {
    const nextReviewAt = nextReviewMap.get(id);
    if (nextReviewAt == null) {
      neverReviewed.push(id);
      continue;
    }
    const at = new Date(nextReviewAt).getTime();
    if (at <= now) {
      due.push({ id, at });
    } else {
      notYetDue.push({ id, at });
    }
  }

  due.sort((a, b) => a.at - b.at);
  notYetDue.sort((a, b) => a.at - b.at);

  return [...due.map((x) => x.id), ...neverReviewed, ...notYetDue.map((x) => x.id)];
}
