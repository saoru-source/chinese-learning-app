"use client";

import { useState } from "react";
import { submitPassageSummary } from "@/lib/writing/actions";

export default function SummaryForm({ passageId }: { passageId: number }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setFeedback(null);

    const result = await submitPassageSummary(formData);
    if (result.ok) {
      setFeedback(result.feedback);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div>
      <form action={handleSubmit} className="flex flex-col gap-3">
        <input type="hidden" name="passageId" value={passageId} />
        <textarea
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="ここに中国語で要約を書いてください"
          className="rounded border border-line px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-seal px-4 py-2 text-sm text-ink disabled:opacity-50"
        >
          {loading ? "AIが添削中…" : "AIに添削してもらう"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {feedback && (
        <div className="mt-6 rounded border border-line bg-paper-deep p-4">
          <p className="mb-2 text-sm font-bold text-ink-soft">AIの添削結果</p>
          <p className="whitespace-pre-wrap text-sm">{feedback}</p>
        </div>
      )}
    </div>
  );
}
