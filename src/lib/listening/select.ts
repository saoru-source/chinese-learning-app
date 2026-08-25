import type { SupabaseClient } from "@supabase/supabase-js";

export type ListeningMode = "choice" | "dictation";

export type ListeningQuestion = {
  id: number;
  hsk_level: number;
  text_zh: string;
  correct_answer: string;
  choices: string[] | null;
};

// 単語・文法の苦手優先(getWeakWords等、incorrect_count >= correct_countなら
// 問答無用で最優先)と違い、ヒアリングは全120問(選択式60+ディクテーション60)
// と単語(4,680件)・文法(133件)に比べて母数が少ないため、同じ問題が短い間隔で
// 繰り返し出てしまう。そのため「必ず優先」ではなく「重みが高いほど当たりやすい
// 抽選」という緩やかな方式にする。
//
// 重み計算式(不正解1回につき+1、正解1回につき-0.5、最低1):
//   - 未回答の問題: 重み2(=不正解1回分と同じ扱い。一度も見ていない問題も
//     ある程度出やすくする)
//   - 既回答の問題: max(1, 1 + 不正解数 - 正解数 * 0.5)
// この式だと「1回間違えただけ(不正解1・正解0)」で重み2、「2回間違えた
// (不正解2・正解0)」で重み3となり、正解を重ねて最低重み1まで下がった
// 問題と比べてそれぞれ2倍・3倍出やすくなる程度に収まる
// (依頼にあった「2〜3倍程度」の目安と一致する)。
function computeWeight(
  progress: { correct_count: number; incorrect_count: number } | undefined,
): number {
  if (!progress) return 2;
  return Math.max(1, 1 + progress.incorrect_count - progress.correct_count * 0.5);
}

// Math.randomをサーバーコンポーネントの本体で直接呼ぶとreact-hooks/purityの
// lintエラーになるため、他の抽選ロジック(pickRandom.ts等)と同様に
// 通常のユーティリティ関数に切り出している。
function weightedPick<T>(rows: { item: T; weight: number }[]): T {
  const total = rows.reduce((sum, r) => sum + r.weight, 0);
  let r = Math.random() * total;
  for (const row of rows) {
    r -= row.weight;
    if (r <= 0) return row.item;
  }
  return rows[rows.length - 1].item;
}

// 選択式(/listening/choice)・ディクテーション(/listening/dictation)共用。
// そのmodeの全問題(60問)を取得し、ユーザーの正誤履歴(progress、
// item_type='listening_question')から重みを計算した上で、重み付き抽選で
// 1問選ぶ。
export async function pickWeightedListeningQuestion(
  supabase: SupabaseClient,
  userId: string,
  mode: ListeningMode,
): Promise<ListeningQuestion | null> {
  const { data: rows } = await supabase
    .from("listening_questions")
    .select("id, hsk_level, text_zh, correct_answer, choices")
    .eq("mode", mode);

  const allRows = rows ?? [];
  if (allRows.length === 0) return null;

  const { data: progressRows } = await supabase
    .from("progress")
    .select("item_id, correct_count, incorrect_count")
    .eq("user_id", userId)
    .eq("item_type", "listening_question");

  const progressMap = new Map(
    (progressRows ?? []).map((p) => [p.item_id, p]),
  );

  const weighted = allRows.map((row) => ({
    item: row,
    weight: computeWeight(progressMap.get(row.id)),
  }));

  return weightedPick(weighted);
}
