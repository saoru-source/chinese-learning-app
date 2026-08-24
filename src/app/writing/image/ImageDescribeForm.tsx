"use client";

import { useState } from "react";
import GlassButton from "@/components/GlassButton";
import { submitImagePrompt } from "@/lib/writing/actions";

export default function ImageDescribeForm({ promptId }: { promptId: number }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setFeedback(null);

    const result = await submitImagePrompt(formData);
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
        <input type="hidden" name="promptId" value={promptId} />
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
            fontSize: 14,
            color: "var(--ink)",
            lineHeight: 1.7,
            resize: "vertical",
            boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
          }}
        />
        <GlassButton type="submit" fullWidth disabled={loading || !text.trim()}>
          {loading ? "AIが添削中…" : "AIに添削してもらう"}
        </GlassButton>
      </form>

      {error && (
        <p style={{ marginTop: 14, fontSize: 12, fontWeight: 700, color: "var(--miss-red)" }}>{error}</p>
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
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 8 }}>AIの添削結果</p>
          <p style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{feedback}</p>
        </div>
      )}
    </div>
  );
}
