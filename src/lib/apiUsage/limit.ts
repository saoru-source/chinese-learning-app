import type { createClient } from "@/lib/supabase/server";

// Claude Haiku 4.5の料金(2026-08時点、$1/MTok入力・$5/MTok出力)を基準に、
// AI出題1回(10問バッチ、入出力あわせて概算2,000トークン前後)も、作文/画像描写/
// 長文要約添削1回(概算1,000トークン前後)も、1回あたり1円未満(0.1〜1円程度)に
// 収まる計算。1日の実利用は熱心な学習者でも数回〜十数回程度(AI出題数バッチ+
// 作文提出数件)と想定されるため、悪意ある連打・スクリプトからの費用暴走を
// 防ぎつつ通常利用を妨げない値として、実利用想定の2〜3倍程度の余裕を見て
// 30回/日とした(4機能合算のカウント。数値を変える場合はここだけを直せばよい)。
export const DAILY_AI_CALL_LIMIT = 30;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

// AI出題(/quiz/ai)・作文添削・画像描写添削・長文要約添削の4機能で共用する、
// Claude API呼び出し前のチェック兼カウント関数。1ユーザー1日1行(api_usage
// テーブル)で呼び出し回数を合算管理し、上限に達していれば呼び出し前に
// { ok: false } を返す(実際にはClaude APIを呼ばない)。達していなければ
// カウントを1つ進めてから { ok: true } を返す(呼び出しの成否に関わらず
// 消費する「予約」方式 — 失敗時も入力トークン分の費用は発生するため)。
export async function checkAndConsumeApiUsage(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const usageDate = todayUtc();

  const { data: existing } = await supabase
    .from("api_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("usage_date", usageDate)
    .maybeSingle();

  if (existing && existing.count >= DAILY_AI_CALL_LIMIT) {
    return {
      ok: false,
      error: "本日のAI機能の利用上限に達しました。明日また利用できます。",
    };
  }

  if (existing) {
    await supabase
      .from("api_usage")
      .update({ count: existing.count + 1 })
      .eq("user_id", userId)
      .eq("usage_date", usageDate);
  } else {
    await supabase.from("api_usage").insert({
      user_id: userId,
      usage_date: usageDate,
      count: 1,
    });
  }

  return { ok: true };
}
