"use client";

import { useState } from "react";

type Question = {
  id: number;
  question_order: number;
  question_text: string;
  choices: string[];
  correct_choice_index: number;
};

const LABELS = ["A", "B", "C", "D"];

export default function ReadingQuestions({
  questions,
}: {
  questions: Question[];
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = questions.filter(
    (q) => answers[q.id] === q.correct_choice_index
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {questions.map((q) => (
        <div key={q.id} className="rounded border border-line p-4">
          <p className="mb-3 text-sm font-bold">
            {q.question_order}. {q.question_text}
          </p>
          <div className="flex flex-col gap-2">
            {q.choices.map((choice, i) => {
              const isSelected = answers[q.id] === i;
              const isCorrect = i === q.correct_choice_index;
              const showResult = submitted;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={submitted}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [q.id]: i }))
                  }
                  className={`rounded border px-3 py-2 text-left text-sm ${
                    showResult && isCorrect
                      ? "border-jade bg-jade/20"
                      : showResult && isSelected
                        ? "border-red-400 bg-red-50"
                        : !showResult && isSelected
                          ? "border-seal bg-seal/20"
                          : "border-line"
                  }`}
                >
                  {LABELS[i]}　{choice}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < questions.length}
          className="rounded bg-seal px-6 py-2 text-sm text-ink disabled:opacity-50"
        >
          採点する
        </button>
      ) : (
        <p className="text-center text-sm text-ink-soft">
          {questions.length}問中 {score}問正解
        </p>
      )}
    </div>
  );
}
