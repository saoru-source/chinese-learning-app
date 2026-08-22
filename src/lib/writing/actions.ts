"use server";

import Anthropic from "@anthropic-ai/sdk";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitWriting(
  formData: FormData
): Promise<{ ok: true; feedback: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const topicId = Number(formData.get("topicId"));
  const text = (formData.get("text") as string)?.trim();

  if (!text) {
    return { ok: false, error: "作文を入力してください。" };
  }

  const { data: topic } = await supabase
    .from("writing_topics")
    .select("prompt_text, hsk_level")
    .eq("id", topicId)
    .maybeSingle();

  if (!topic) {
    return { ok: false, error: "お題が見つかりませんでした。" };
  }

  const prompt = `あなたは中国語作文の先生です。以下はHSK${topic.hsk_level}級の
学習者が、お題「${topic.prompt_text}」に対して書いた中国語の作文です。

学習者の作文:
${text}

この作文を読み、次の内容を日本語で分かりやすく述べてください(箇条書きで構いません)。
1. 文法・語彙の誤りがあれば指摘し、正しい表現を提案する
2. より自然な言い回しがあれば提案する
3. 良かった点を1つ以上褒める
出力はプレーンテキストのみで、JSON形式にはしないでください。`;

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const feedback =
      textBlock && textBlock.type === "text"
        ? textBlock.text
        : "AIからの応答が空でした。";

    await supabase.from("writing_submissions").insert({
      user_id: user.id,
      item_type: "topic",
      item_id: topicId,
      submitted_text: text,
      ai_feedback: feedback,
    });

    return { ok: true, feedback };
  } catch (e) {
    console.error("submitWriting failed", e);
    return {
      ok: false,
      error: "AIによる添削に失敗しました。時間をおいて再度お試しください。",
    };
  }
}
