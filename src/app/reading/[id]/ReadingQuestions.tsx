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

  const score = questions.filter((q) => answers[q.id] === q.correct_choice_index).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {questions.map((q) => {
        const selected = answers[q.id];
        const isCorrect = submitted && selected === q.correct_choice_index;

        return (
          <div key={q.id}>
            <p style={{ fontSize: 15.6, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>
              Q{q.question_order}. {q.question_text}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {q.choices.map((choice, i) => {
                const isSelected = selected === i;
                const isChoiceCorrect = i === q.correct_choice_index;
                const showResult = submitted;

                const background = showResult && isChoiceCorrect
                  ? "var(--jade)"
                  : showResult && isSelected
                    ? "color-mix(in srgb, var(--seal) 25%, var(--card))"
                    : "var(--card)";
                // ライトモードのyebe/pinkテーマは--seal-deep(#FFE8FF)がほぼ白に近く、
                // ほぼ白い背景(color-mix上のchip)の上の文字色に使うと視認性が
                // 著しく低下する(実測コントラスト比約1:1)。--inkは全テーマ・
                // 両モードで背景と十分なコントラストを持つよう設計されているため、
                // こちらを使う。
                const color = showResult && isChoiceCorrect ? "#fff" : "var(--ink)";

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                    style={{
                      textAlign: "left",
                      borderRadius: 12,
                      padding: "10px 12px",
                      fontSize: 18,
                      background,
                      color,
                      // 同上の理由でborderも--seal-deepではなく--sealを使う
                      // (yebe/pinkライトモードで枠線がほぼ見えなくなるため)
                      border: isSelected && !showResult ? "1.5px solid var(--seal)" : "1px solid var(--line)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      cursor: submitted ? "default" : "pointer",
                    }}
                  >
                    {LABELS[i]}　{choice}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <p
                style={{
                  marginTop: 8,
                  fontSize: 14.4,
                  fontWeight: 700,
                  color: "var(--ink)",
                }}
              >
                {isCorrect
                  ? "✓ 正解！"
                  : `✗ 不正解。正解は「${LABELS[q.correct_choice_index]} ${q.choices[q.correct_choice_index]}」でした。`}
              </p>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < questions.length}
          style={{
            width: "100%",
            background: "var(--grad)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16.8,
            border: "none",
            borderRadius: 999,
            padding: "12px 0",
            opacity: Object.keys(answers).length < questions.length ? 0.4 : 1,
            cursor: Object.keys(answers).length < questions.length ? "default" : "pointer",
          }}
        >
          採点する
        </button>
      ) : (
        <p style={{ textAlign: "center", fontSize: 15.6, color: "var(--ink-soft)" }}>
          {questions.length}問中 <span style={{ fontWeight: 700, color: "var(--ink)" }}>{score}問</span> 正解
        </p>
      )}
    </div>
  );
}
