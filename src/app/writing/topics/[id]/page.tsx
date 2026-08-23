import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WritingForm from "./WritingForm";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export default async function WritingTopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: topic } = await supabase
    .from("writing_topics")
    .select("id, hsk_level, category, prompt_text")
    .eq("id", id)
    .maybeSingle();

  if (!topic) {
    notFound();
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/writing/topics" aria-label="お題一覧に戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>作文のお題</h1>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
          padding: "20px 20px",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: "var(--grad)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 600,
            borderRadius: 20,
            padding: "3px 12px",
            marginBottom: 12,
          }}
        >
          HSK{topic.hsk_level} ・ {topic.category === "free_topic" ? "自由作文" : "場面設定"}
        </span>
        <p style={{ fontSize: 17, color: "var(--ink)", lineHeight: 1.6 }}>{topic.prompt_text}</p>
      </div>

      <WritingForm key={topic.id} topicId={topic.id} />
    </main>
  );
}
