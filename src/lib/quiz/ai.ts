"use server";

import Anthropic from "@anthropic-ai/sdk";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWeakWords } from "@/lib/quiz/select";

export type AiSentence = {
  hanzi: string;
  pinyin: string;
  meaning_ja: string;
  explanation_ja: string;
  usedWordIds: number[];
};

export async function generateAiSentence(): Promise<
  { ok: true; sentence: AiSentence } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const weakWords = await getWeakWords(supabase, user.id, 3);
  if (weakWords.length === 0) {
    return { ok: false, error: "出題できる単語がありません。" };
  }

  const wordList = weakWords
    .map((w) => `${w.hanzi}（${w.pinyin}、意味:${w.meaning_ja}、HSK${w.hsk_level}）`)
    .join("、");

  const prompt = `あなたは中国語学習アプリの出題担当です。以下の単語のうち、
少なくとも1つ(できれば複数)を使った、自然な中国語の例文を1つ作成してください。

対象単語: ${wordList}

出力は以下のJSON形式のみで、他のテキストやMarkdownの装飾は一切含めないでください。
{
  "hanzi": "中国語の例文(簡体字)",
  "pinyin": "その例文の拼音(声調記号付き)",
  "meaning_ja": "日本語訳",
  "explanation_ja": "使った単語や文法についての簡潔な日本語解説(1〜2文)"
}`;

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

    return {
      ok: true,
      sentence: {
        hanzi: parsed.hanzi,
        pinyin: parsed.pinyin,
        meaning_ja: parsed.meaning_ja,
        explanation_ja: parsed.explanation_ja ?? "",
        usedWordIds: weakWords.map((w) => w.id),
      },
    };
  } catch (e) {
    console.error("generateAiSentence failed", e);
    return { ok: false, error: "AIによる例文生成に失敗しました。時間をおいて再度お試しください。" };
  }
}

export async function recordAiSentenceResult(
  usedWordIds: number[],
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
    const { data: existing } = await supabase
      .from("progress")
      .select("id, correct_count, incorrect_count")
      .eq("user_id", user.id)
      .eq("item_type", "word")
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
        item_type: "word",
        item_id: itemId,
        correct_count: correct ? 1 : 0,
        incorrect_count: correct ? 0 : 1,
        last_studied_at: new Date().toISOString(),
      });
    }
  }
}
