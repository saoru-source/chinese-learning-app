import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HSK_LEVELS, MILESTONE_HALVES, computeMilestoneStatus, type MilestoneHalf, type MilestoneStatus } from "@/lib/milestones/select";

const HALF_LABEL: Record<MilestoneHalf, string> = {
  first: "前半",
  second: "後半",
};

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

function StatusBadge({ status }: { status: MilestoneStatus }) {
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

export default async function MilestonesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: attemptRows } = user
    ? await supabase
        .from("milestone_attempts")
        .select("hsk_level, half, passed")
        .eq("user_id", user.id)
    : { data: [] };

  const attempts = attemptRows ?? [];

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Link href="/learn" aria-label="学習に戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 19.2, fontWeight: 700, color: "var(--ink)" }}>節目テスト</h1>
      </div>
      <p style={{ fontSize: 13.2, color: "var(--ink-soft)", marginBottom: 18 }}>
        各レベルの単語を前半・後半に分けて、10問中8問以上の正解で合格です。何度でも挑戦できます。
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {HSK_LEVELS.map((level) => (
          <div
            key={level}
            style={{
              background: "var(--card)",
              borderRadius: 18,
              padding: "14px 16px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ fontSize: 15.6, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>
              HSK{level}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {MILESTONE_HALVES.map((half) => {
                const status = computeMilestoneStatus(attempts, level, half);
                return (
                  <Link
                    key={half}
                    href={`/milestones/${level}/${half}`}
                    className="active:scale-[0.97] transition-transform"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      background: "var(--paper-deep)",
                      borderRadius: 14,
                      padding: "12px 8px",
                      textDecoration: "none",
                    }}
                  >
                    <span style={{ fontSize: 14.4, fontWeight: 700, color: "var(--ink)" }}>
                      {HALF_LABEL[half]}
                    </span>
                    <StatusBadge status={status} />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
