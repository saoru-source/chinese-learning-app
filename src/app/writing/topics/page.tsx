import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="var(--ink-soft)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function TopicList({ topics }: { topics: { id: number; hsk_level: number; prompt_text: string }[] }) {
  if (topics.length === 0) {
    return <p style={{ fontSize: 12, color: "var(--ink-soft)" }}>お題がありません。</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {topics.map((t) => (
        <Link
          key={t.id}
          href={`/writing/topics/${t.id}`}
          className="active:scale-[0.98] transition-transform"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#fff",
            borderRadius: 15,
            padding: "13px 16px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              flexShrink: 0,
              fontSize: 10,
              fontWeight: 700,
              color: "var(--ink)",
              background: "var(--paper-deep)",
              borderRadius: 20,
              padding: "3px 9px",
            }}
          >
            HSK{t.hsk_level}
          </span>
          <span style={{ flex: 1, fontSize: 13, color: "var(--ink)", lineHeight: 1.5 }}>{t.prompt_text}</span>
          <ChevronRightIcon />
        </Link>
      ))}
    </div>
  );
}

export default async function WritingTopicsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: topics } = await supabase
    .from("writing_topics")
    .select("id, hsk_level, category, prompt_text")
    .order("id", { ascending: true });

  const freeTopics = (topics ?? []).filter((t) => t.category === "free_topic");
  const scenarios = (topics ?? []).filter((t) => t.category === "scenario");

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/writing" aria-label="ライティングに戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>作文のお題</h1>
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 10 }}>
          自由作文 <span style={{ fontWeight: 400 }}>・テーマについて自由に書く</span>
        </h2>
        <TopicList topics={freeTopics} />
      </section>

      <section>
        <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 10 }}>
          場面設定 <span style={{ fontWeight: 400 }}>・お題も中国語のみで提示されます</span>
        </h2>
        <TopicList topics={scenarios} />
      </section>
    </main>
  );
}
