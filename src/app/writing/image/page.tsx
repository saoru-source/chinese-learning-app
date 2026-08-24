import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { randomOffset } from "@/lib/listening/pickRandom";
import ImageDescribeForm from "./ImageDescribeForm";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

function Header() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <Link href="/writing" aria-label="ライティングに戻る" style={{ display: "flex", alignItems: "center" }}>
        <BackArrowIcon />
      </Link>
      <h1 style={{ fontSize: 19.2, fontWeight: 700, color: "var(--ink)" }}>画像描写</h1>
    </div>
  );
}

export default async function WritingImagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { count } = await supabase
    .from("writing_image_prompts")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);

  const total = count ?? 0;

  if (total === 0) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
        <Header />
        <div
          style={{
            background: "var(--card)",
            borderRadius: 22,
            boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--grad)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28.8,
              margin: "0 auto 16px",
            }}
          >
            🖼️
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>近日公開</p>
          <p style={{ fontSize: 15.6, color: "var(--ink-soft)", lineHeight: 1.7 }}>
            画像描写モードは現在準備中です。画像素材が揃い次第、公開します。
          </p>
        </div>
      </main>
    );
  }

  const offset = randomOffset(total);
  const { data } = await supabase
    .from("writing_image_prompts")
    .select("id, image_url, hsk_level, topic")
    .eq("is_published", true)
    .order("id", { ascending: true })
    .range(offset, offset);

  const prompt = data?.[0] ?? null;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <Header />

      {prompt ? (
        <>
          <div
            style={{
              background: "var(--card)",
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
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 20,
                padding: "3px 12px",
                marginBottom: 12,
              }}
            >
              HSK{prompt.hsk_level}
            </span>
            <img
              src={prompt.image_url}
              alt={prompt.topic ?? "画像描写のお題"}
              style={{
                width: "100%",
                borderRadius: 14,
                display: "block",
                marginBottom: prompt.topic ? 10 : 0,
              }}
            />
            {prompt.topic && (
              <p style={{ fontSize: 15.6, color: "var(--ink-soft)", lineHeight: 1.6 }}>{prompt.topic}</p>
            )}
          </div>

          <p style={{ fontSize: 14.4, color: "var(--ink-soft)", marginBottom: 12 }}>
            上の画像を見て、その内容を中国語で説明してください。
          </p>

          <ImageDescribeForm key={prompt.id} promptId={prompt.id} />
        </>
      ) : (
        <p style={{ fontSize: 15.6, color: "var(--ink-soft)", textAlign: "center" }}>お題が見つかりませんでした。</p>
      )}
    </main>
  );
}
