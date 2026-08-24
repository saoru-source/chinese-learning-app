import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { tokenizePassage } from "@/lib/reading/segment";
import TappableText from "@/components/TappableText";
import SpeakButton from "@/components/SpeakButton";
import ReadingQuestions from "./ReadingQuestions";
import ShareButton from "@/components/ShareButton";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15z" />
      <path d="M4 18a2.5 2.5 0 0 1 2.5-2.5H20" />
    </svg>
  );
}

export default async function ReadingPassagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: passage } = await supabase
    .from("long_passages")
    .select("id, hsk_level, title, body")
    .eq("id", id)
    .maybeSingle();

  if (!passage) {
    notFound();
  }

  const { data: rawQuestions } = await supabase
    .from("passage_questions")
    .select("id, question_order, question_text, choices, correct_choice_index")
    .eq("passage_id", id)
    .order("question_order", { ascending: true });

  // 選択肢の並びはデータ作成時点でランダム化済み(正解の位置が
  // A〜Dに均等に分散するようにCSV生成スクリプト側でシャッフルしてある)。
  const questions = (rawQuestions ?? []).map((q) => ({
    id: q.id,
    question_order: q.question_order,
    question_text: q.question_text,
    choices: q.choices as string[],
    correct_choice_index: q.correct_choice_index,
  }));

  const segments = await tokenizePassage(supabase, passage.body, passage.hsk_level);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let followingList: { id: string; nickname: string }[] = [];
  if (user) {
    const { data: followingRows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);
    const followingIds = (followingRows ?? []).map((r) => r.following_id);
    if (followingIds.length) {
      const { data } = await supabase
        .from("users")
        .select("id, nickname")
        .in("id", followingIds);
      followingList = data ?? [];
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/reading" aria-label="一覧に戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <div>
          <p style={{ fontSize: 15.6, fontWeight: 700, color: "var(--ink)" }}>{passage.title}</p>
          <p style={{ fontSize: 12, color: "var(--ink-soft)" }}>
            HSK{passage.hsk_level} · 約{passage.body.length}字
          </p>
        </div>
      </div>

      <div
        style={{
          background: "var(--card)",
          borderRadius: 22,
          boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
          padding: "20px 20px",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <TappableText segments={segments} fontSize={16.8} lineHeight={2.0} />
          </div>
          <SpeakButton text={passage.body} size={28} />
        </div>

        <p style={{ fontSize: 13.2, color: "var(--ink-soft)", textAlign: "center", marginTop: 14 }}>
          本文中の単語をタップすると意味と発音がポップアップ表示されます
        </p>

        <div style={{ borderTop: "1px solid var(--line)", margin: "16px 0" }} />

        <ReadingQuestions questions={questions} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <ShareButton itemType="passage" itemId={passage.id} followingList={followingList} />
      </div>

      <Link
        href={`/reading/${passage.id}/summary`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          background: "var(--grad)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 16.8,
          borderRadius: 999,
          padding: "13px 0",
          boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
          textDecoration: "none",
        }}
      >
        <BookIcon />
        読んだ内容を中国語で要約する
      </Link>
    </main>
  );
}
