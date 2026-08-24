import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GoalCard from "@/components/GoalCard";
import HeroReviewCard from "@/components/HeroReviewCard";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? (
        await supabase
          .from("users")
          .select("nickname")
          .eq("id", user.id)
          .maybeSingle()
      ).data
    : null;

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">中国語学習アプリ</h1>
        <p className="text-sm text-ink-soft">未ログインです</p>
        <div className="flex gap-3 text-sm">
          <Link href="/login" className="rounded bg-seal px-4 py-2 text-ink">
            ログイン
          </Link>
          <Link href="/signup" className="rounded border border-line px-4 py-2">
            新規登録
          </Link>
        </div>
      </main>
    );
  }

  const displayName = profile?.nickname ?? user.email ?? "";

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <GoalCard />

        <HeroReviewCard displayName={displayName} />

        {!profile?.nickname && (
          <p className="text-center text-xs text-ink-soft">
            <Link href="/profile" className="underline">
              ニックネームを設定する →
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
