"use client";

import { useState } from "react";
import { submitGrammarSentence } from "@/lib/writing/actions";
import AiFeedbackText from "@/components/AiFeedbackText";

export default function GrammarWritingForm({ grammarPointId }: { grammarPointId: number }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setFeedback(null);

    const result = await submitGrammarSentence(formData);
    if (result.ok) {
      setFeedback(result.feedback);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div>
      <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="hidden" name="grammarPointId" value={grammarPointId} />
        <textarea
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="ここに中国語で書いてください"
          style={{
            background: "var(--card)",
            borderRadius: 16,
            border: "1px solid var(--line)",
            padding: "14px 16px",
            fontSize: 16.8,
            color: "var(--ink)",
            lineHeight: 1.7,
            resize: "vertical",
            boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
          }}
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          style={{
            background: "var(--grad)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16.8,
            border: "none",
            borderRadius: 999,
            padding: "13px 0",
            boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
            opacity: loading || !text.trim() ? 0.5 : 1,
            cursor: loading || !text.trim() ? "default" : "pointer",
          }}
        >
          {loading ? "AIが添削中…" : "AIに添削してもらう"}
        </button>
      </form>

      {error && (
        <p style={{ marginTop: 14, fontSize: 14.4, fontWeight: 700, color: "var(--miss-red)" }}>{error}</p>
      )}

      {feedback && (
        <div
          style={{
            marginTop: 16,
            background: "var(--card)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
          }}
        >
          <p style={{ fontSize: 14.4, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 8 }}>AIの添削結果</p>
          <AiFeedbackText text={feedback} />
        </div>
      )}
    </div>
  );
}
