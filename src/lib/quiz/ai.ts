"use server";

import Anthropic from "@anthropic-ai/sdk";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWeakWords, getWeakGrammarPoints } from "@/lib/quiz/select";

export type QuizScope = "word" | "grammar" | "mix";

export type AiSentence = {
  hanzi: string;
  pinyin: string;
  meaning_ja: string;
  explanation_ja: string;
  usedWordIds: number[];
  usedGrammarPointId: number | null;
};

function buildWordPrompt(
  scope: "word" | "mix",
  level: number,
  wordList: string,
): string {
  const focusInstruction =
    scope === "word"
      ? "語彙の意味・使い方・ピンインの理解を問うことを重視した、シンプルな例文にしてください。"
      : "";

  return `あなたは中国語学習アプリの出題担当です。以下の単語のうち、
少なくとも1つ(できれば複数)を使った、自然なHSK${level}レベルの中国語の例文を1つ作成してください。
${focusInstruction}

対象単語: ${wordList}

出力は以下のJSON形式のみで、他のテキストやMarkdownの装飾は一切含めないでください。
{
  "hanzi": "中国語の例文(簡体字)",
  "pinyin": "その例文の拼音(声調記号付き)",
  "meaning_ja": "日本語訳",
  "explanation_ja": "使った単語や文法についての簡潔な日本語解説(1〜2文)"
}`;
}

function buildGrammarPrompt(level: number, label: string, explanation: string | null): string {
  return `あなたは中国語学習アプリの出題担当です。
以下の文法パターンの用法を練習させる、HSK${level}レベルの中国語の例文を1つ作成してください。
可能であれば、文法パターンが使われている箇所を「___」で穴埋めにしてください。

文法パターン: ${label}
文法の説明: ${explanation ?? "(説明なし)"}

出力は以下のJSON形式のみで、他のテキストやMarkdownの装飾は一切含めないでください。
{
  "hanzi": "中国語の例文(簡体字。穴埋め形式にする場合は空欄部分を___にする)",
  "pinyin": "その例文の拼音(声調記号付き)",
  "meaning_ja": "日本語訳",
  "explanation_ja": "この文法パターンの使い方についての簡潔な日本語解説(1〜2文)"
}`;
}

async function callAnthropic(
  prompt: string,
): Promise<{ ok: true; parsed: Record<string, unknown> } | { ok: false; error: string }> {
  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { ok: false, error: "AIからの応答が空でした。" };
    }

    const jsonText = textBlock.text.trim().replace(/^```json\s*|```$/g, "");
    const parsed = JSON.parse(jsonText);

    if (!parsed.hanzi || !parsed.pinyin || !parsed.meaning_ja) {
      return { ok: false, error: "AIの応答の形式が不正でした。" };
    }

    return { ok: true, parsed };
  } catch (e) {
    console.error("generateAiSentence failed", e);
    return { ok: false, error: "AIによる例文生成に失敗しました。時間をおいて再度お試しください。" };
  }
}

export async function generateAiSentence(
  scope: QuizScope,
  level: number,
): Promise<{ ok: true; sentence: AiSentence } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (scope === "grammar") {
    const points = await getWeakGrammarPoints(supabase, user.id, level, 1);
    if (points.length === 0) {
      return { ok: false, error: "このレベルの文法項目がまだありません。" };
    }
    const point = points[0];
    const prompt = buildGrammarPrompt(level, point.label, point.explanation);
    const result = await callAnthropic(prompt);
    if (!result.ok) return result;

    return {
      ok: true,
      sentence: {
        hanzi: result.parsed.hanzi as string,
        pinyin: result.parsed.pinyin as string,
        meaning_ja: result.parsed.meaning_ja as string,
        explanation_ja: (result.parsed.explanation_ja as string) ?? "",
        usedWordIds: [],
        usedGrammarPointId: point.id,
      },
    };
  }

  const weakWords = await getWeakWords(supabase, user.id, level, 3);
  if (weakWords.length === 0) {
    return { ok: false, error: "出題できる単語がありません。" };
  }

  const wordList = weakWords
    .map((w) => `${w.hanzi}（${w.pinyin}、意味:${w.meaning_ja}、HSK${w.hsk_level}）`)
    .join("、");

  const prompt = buildWordPrompt(scope, level, wordList);
  const result = await callAnthropic(prompt);
  if (!result.ok) return result;

  return {
    ok: true,
    sentence: {
      hanzi: result.parsed.hanzi as string,
      pinyin: result.parsed.pinyin as string,
      meaning_ja: result.parsed.meaning_ja as string,
      explanation_ja: (result.parsed.explanation_ja as string) ?? "",
      usedWordIds: weakWords.map((w) => w.id),
      usedGrammarPointId: null,
    },
  };
}

async function upsertProgress(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  itemType: "word" | "grammar",
  itemId: number,
  correct: boolean
) {
  const { data: existing } = await supabase
    .from("progress")
    .select("id, correct_count, incorrect_count")
    .eq("user_id", userId)
    .eq("item_type", itemType)
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
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      correct_count: correct ? 1 : 0,
      incorrect_count: correct ? 0 : 1,
      last_studied_at: new Date().toISOString(),
    });
  }
}

export async function recordAiSentenceResult(
  usedWordIds: number[],
  usedGrammarPointId: number | null,
  correct: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  for (const itemId of usedWordIds) {
    await upsertProgress(supabase, user.id, "word", itemId, correct);
  }
  if (usedGrammarPointId !== null) {
    await upsertProgress(supabase, user.id, "grammar", usedGrammarPointId, correct);
  }
}
