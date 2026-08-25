import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildMilestoneQuestions, type MilestoneHalf } from "@/lib/milestones/select";
import MilestoneQuiz from "./MilestoneQuiz";

export default async function MilestoneQuizPage({
  params,
}: {
  params: Promise<{ level: string; half: string }>;
}) {
  const { level: levelParam, half: halfParam } = await params;
  const level = Number(levelParam);

  if (!Number.isInteger(level) || level < 1 || level > 6) {
    notFound();
  }
  if (halfParam !== "first" && halfParam !== "second") {
    notFound();
  }
  const half = halfParam as MilestoneHalf;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const questions = await buildMilestoneQuestions(supabase, level, half);

  if (questions.length === 0) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
        <p style={{ fontSize: 16.8, color: "var(--ink-soft)", textAlign: "center" }}>
          この節目の単語が見つかりませんでした。
        </p>
      </main>
    );
  }

  return (
    <MilestoneQuiz
      key={questions.map((q) => q.wordId).join("-")}
      hskLevel={level}
      half={half}
      questions={questions}
    />
  );
}
