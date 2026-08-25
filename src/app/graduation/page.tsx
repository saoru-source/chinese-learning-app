import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  HSK_LEVELS,
  computeGraduationStatus,
  isGraduationUnlocked,
  type GraduationStatus,
} from "@/lib/graduation/select";
import type { MilestoneHalf } from "@/lib/milestones/select";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function StatusBadge({ status }: { status: GraduationStatus }) {
  if (status === "passed") {
    return (
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#fff",
          background: "var(--match-green)",
          borderRadius: 999,
          padding: "3px 10px",
        }}
      >
        合格
      </span>
    );
  }
  if (status === "attempted") {
    return (
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "var(--miss-red)",
          background: "color-mix(in srgb, var(--miss-red) 15%, var(--card))",
          borderRadius: 999,
          padding: "3px 10px",
        }}
      >
        未合格
      </span>
    );
  }
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: "var(--ink-soft)",
        background: "var(--paper-deep)",
        borderRadius: 999,
        padding: "3px 10px",
      }}
    >
      未受験
    </span>
  );
}

export default async function GraduationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: milestoneRows }, { data: graduationRows }] = user
    ? await Promise.all([
        supabase.from("milestone_attempts").select("hsk_level, half, passed").eq("user_id", user.id),
        supabase.from("graduation_attempts").select("hsk_level, passed").eq("user_id", user.id),
      ])
    : [{ data: [] }, { data: [] }];

  const milestoneAttempts = (milestoneRows ?? []) as { hsk_level: number; half: MilestoneHalf; passed: boolean }[];
  const graduationAttempts = graduationRows ?? [];

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Link href="/learn" aria-label="学習に戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 19.2, fontWeight: 700, color: "var(--ink)" }}>HSK卒業試験</h1>
      </div>
      <p style={{ fontSize: 13.2, color: "var(--ink-soft)", marginBottom: 18 }}>
        各レベルの単語・文法をまとめて20問中16問以上の正解で合格です。前半・後半どちらの
        <Link href="/milestones" style={{ color: "var(--seal)", fontWeight: 700 }}>節目テスト</Link>
        にも合格すると挑戦できます。何度でも挑戦できます。
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {HSK_LEVELS.map((level) => {
          const unlocked = isGraduationUnlocked(milestoneAttempts, level);
          const status = computeGraduationStatus(graduationAttempts, level);

          return (
            <div
              key={level}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                background: "var(--card)",
                borderRadius: 18,
                padding: "14px 16px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                opacity: unlocked ? 1 : 0.7,
              }}
            >
              <div>
                <p style={{ fontSize: 15.6, fontWeight: 700, color: "var(--ink)" }}>HSK{level}</p>
                {!unlocked && (
                  <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
                    <LockIcon />
                    節目テスト(前半・後半)に先に合格してください
                  </p>
                )}
              </div>

              {unlocked ? (
                <Link
                  href={`/graduation/${level}`}
                  className="active:scale-[0.97] transition-transform"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    textDecoration: "none",
                  }}
                >
                  <StatusBadge status={status} />
                  <span style={{ fontSize: 12.6, fontWeight: 700, color: "var(--seal)" }}>挑戦する</span>
                </Link>
              ) : (
                <StatusBadge status={status} />
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
