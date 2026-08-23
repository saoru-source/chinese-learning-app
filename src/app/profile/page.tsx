import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { upsertNickname } from "@/lib/profile/actions";
import { signOut } from "@/lib/supabase/actions";
import ThemeSwitcher from "./ThemeSwitcher";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="var(--ink-soft)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--ink-soft)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.5 6.8-3.9M8.6 13.5l6.8 3.9" />
    </svg>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "16px 12px",
        textAlign: "center",
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>{value}</p>
      <p style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2 }}>{label}</p>
    </div>
  );
}

function LinkRow({
  href,
  iconBg,
  icon,
  title,
  subtitle,
}: {
  href: string;
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="active:scale-[0.98] transition-transform"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#fff",
        borderRadius: 15,
        padding: "13px 16px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: 10,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{title}</p>
        <p style={{ fontSize: 10.5, color: "var(--ink-soft)", marginTop: 1 }}>{subtitle}</p>
      </div>
      <ChevronRightIcon />
    </Link>
  );
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("nickname")
    .eq("id", user.id)
    .maybeSingle();

  const { data: progressRows } = await supabase
    .from("progress")
    .select("item_type, correct_count, incorrect_count, created_at, last_studied_at")
    .eq("user_id", user.id);

  const rows = progressRows ?? [];

  // 正答率: progressの正解数/不正解数の合計から算出(実データに基づく正確な値)。
  let totalCorrect = 0;
  let totalWrong = 0;
  const studiedDates = new Set<string>();
  let masteredWords = 0;

  for (const r of rows) {
    totalCorrect += r.correct_count;
    totalWrong += r.incorrect_count;
    if (r.item_type === "word" && r.correct_count > 0) masteredWords++;
    if (r.created_at) studiedDates.add(r.created_at.slice(0, 10));
    if (r.last_studied_at) studiedDates.add(r.last_studied_at.slice(0, 10));
  }

  const accuracyPct = totalCorrect + totalWrong > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : null;
  // 学習日数: progressの created_at / last_studied_at の日付の和集合から算出した簡易的な目安値。
  // (各行は「最後に学習した日」しか保持しないため、間の日を含む厳密な学習日数ではない)
  const studiedDaysApprox = studiedDates.size;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/" aria-label="トップに戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>マイページ</h1>
      </div>

      {params.message && (
        <p
          style={{
            marginBottom: 14,
            fontSize: 12,
            fontWeight: 700,
            color: "var(--match-green)",
            background: "color-mix(in srgb, var(--match-green) 12%, transparent)",
            borderRadius: 12,
            padding: "10px 14px",
          }}
        >
          {params.message}
        </p>
      )}
      {params.error && (
        <p
          style={{
            marginBottom: 14,
            fontSize: 12,
            fontWeight: 700,
            color: "var(--miss-red)",
            background: "color-mix(in srgb, var(--miss-red) 10%, transparent)",
            borderRadius: 12,
            padding: "10px 14px",
          }}
        >
          {params.error}
        </p>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
          padding: "20px 20px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "var(--grad)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {(profile?.nickname ?? "?").charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
            {profile?.nickname || "ニックネーム未設定"}
          </p>
          <p style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2 }}>
            {profile?.nickname
              ? "フォロー機能で他のユーザーに検索されます"
              : "フォロー機能用の名前がまだありません"}
          </p>
        </div>
      </div>

      <form
        action={upsertNickname}
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
        }}
      >
        <input
          type="text"
          name="nickname"
          defaultValue={profile?.nickname ?? ""}
          required
          maxLength={20}
          placeholder="ニックネームを入力"
          style={{
            flex: 1,
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: "10px 14px",
            fontSize: 13,
            color: "var(--ink)",
          }}
        />
        <button
          type="submit"
          style={{
            flexShrink: 0,
            background: "var(--grad)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            border: "none",
            borderRadius: 12,
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          保存
        </button>
      </form>

      <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 10 }}>学習の記録</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <StatCard value={`${studiedDaysApprox}日`} label="学習日数（目安）" />
        <StatCard value={`${masteredWords}語`} label="習得単語" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <StatCard value={accuracyPct !== null ? `${accuracyPct}%` : "―"} label="正答率" />
        <StatCard value="―" label="連続日数（準備中）" />
      </div>

      <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 10 }}>配色テーマ</h2>
      <div style={{ marginBottom: 20 }}>
        <ThemeSwitcher />
      </div>

      <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 10 }}>みんなとつながる</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        <LinkRow
          href="/users"
          iconBg="var(--grad)"
          icon={<SearchIcon />}
          title="みんなを探す・フォロー"
          subtitle="ニックネームでユーザーを検索してフォローします"
        />
        <LinkRow
          href="/shares"
          iconBg="var(--grad)"
          icon={<ShareIcon />}
          title="共有一覧"
          subtitle="フォロー中の相手と共有した例文・長文を見る"
        />
      </div>

      <form action={signOut}>
        <button
          type="submit"
          style={{
            width: "100%",
            background: "#fff",
            border: "1px solid var(--line)",
            color: "var(--ink-soft)",
            fontWeight: 700,
            fontSize: 13,
            borderRadius: 999,
            padding: "12px 0",
            cursor: "pointer",
          }}
        >
          ログアウト
        </button>
      </form>
    </main>
  );
}
