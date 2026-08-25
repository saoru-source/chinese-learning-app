import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GoalCard from "@/components/GoalCard";
import HeroReviewCard from "@/components/HeroReviewCard";
import MenuTile from "@/components/MenuTile";
import { SpeakIcon, ListenIcon, ReadIcon, WriteIcon, QuizIcon } from "@/components/learnIcons";

const HOME_MENU_TILES = [
  { label: "話す", href: "/learn/speaking", icon: <SpeakIcon />, gradient: "var(--grad)" },
  {
    label: "聞く",
    href: "/listening",
    icon: <ListenIcon />,
    gradient: "linear-gradient(135deg, var(--jade), var(--jade-deep))",
  },
  {
    label: "読む",
    href: "/learn/reading",
    icon: <ReadIcon />,
    gradient: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
  },
  {
    label: "書く",
    href: "/writing",
    icon: <WriteIcon />,
    gradient: "linear-gradient(135deg, var(--seal), var(--gold))",
  },
  {
    label: "ドリル",
    href: "/quiz/ai",
    icon: <QuizIcon />,
    gradient: "linear-gradient(135deg, var(--lavender), var(--seal-deep))",
  },
];

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

  // goal_text(自由記述の目標メモ)は本人専用のuser_goalsテーブルに分離済み
  // (RLS監査(2026-08-25)で、usersテーブル経由だと他人からも読めてしまう
  // 状態だったため)。
  const goal = user
    ? (
        await supabase
          .from("user_goals")
          .select("goal_text")
          .eq("user_id", user.id)
          .maybeSingle()
      ).data
    : null;

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-[28.8px] font-bold">中国語学習アプリ</h1>
        <p className="text-[16.8px] text-ink-soft">未ログインです</p>
        <div className="flex gap-3 text-[16.8px]">
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
        <GoalCard initialGoal={goal?.goal_text} />

        <HeroReviewCard displayName={displayName} />

        {!profile?.nickname && (
          <p className="text-center text-[14.4px] text-ink-soft">
            <Link href="/profile" className="underline">
              ニックネームを設定する →
            </Link>
          </p>
        )}

        <section>
          <h2 style={{ fontSize: 13.2, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 10 }}>
            学習メニュー
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {HOME_MENU_TILES.map((tile) => (
              <MenuTile key={tile.href} label={tile.label} href={tile.href} icon={tile.icon} gradient={tile.gradient} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
