import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildGraduationQuestions, isGraduationUnlocked } from "@/lib/graduation/select";
import type { MilestoneHalf } from "@/lib/milestones/select";
import GraduationQuiz from "./GraduationQuiz";

export default async function GraduationQuizPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level: levelParam } = await params;
  const level = Number(levelParam);

  if (!Number.isInteger(level) || level < 1 || level > 6) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // URL直打ちでの受験条件バイパスを防ぐため、一覧画面だけでなく
  // ここでも節目テスト(前半・後半)合格済みかを確認する。
  const { data: milestoneRows } = await supabase
    .from("milestone_attempts")
    .select("hsk_level, half, passed")
    .eq("user_id", user.id);
  const milestoneAttempts = (milestoneRows ?? []) as { hsk_level: number; half: MilestoneHalf; passed: boolean }[];

  if (!isGraduationUnlocked(milestoneAttempts, level)) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px", textAlign: "center" }}>
        <p style={{ fontSize: 16.8, color: "var(--ink-soft)", marginBottom: 16 }}>
          HSK{level}の卒業試験を受けるには、先に節目テスト(前半・後半)の両方に合格してください。
        </p>
        <Link href="/milestones" style={{ fontSize: 15.6, fontWeight: 700, color: "var(--seal)" }}>
          節目テストへ
        </Link>
      </main>
    );
  }

  const questions = await buildGraduationQuestions(supabase, level);

  if (questions.length === 0) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
        <p style={{ fontSize: 16.8, color: "var(--ink-soft)", textAlign: "center" }}>
          この卒業試験の問題が見つかりませんでした。
        </p>
      </main>
    );
  }

  return (
    <GraduationQuiz
      key={questions.map((q) => `${q.kind}${q.refId}`).join("-")}
      hskLevel={level}
      questions={questions}
    />
  );
}
