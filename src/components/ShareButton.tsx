"use client";

import { useState } from "react";
import { shareItem } from "@/lib/shares/actions";

type Person = { id: string; nickname: string };

export default function ShareButton({
  itemType,
  itemId,
  followingList,
}: {
  itemType: "word" | "sentence" | "passage" | "pattern";
  itemId: number;
  followingList: Person[];
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (followingList.length === 0) {
    return null;
  }

  if (done) {
    return <p className="text-xs text-ink-soft">共有しました</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-ink-soft underline"
      >
        共有する
      </button>
    );
  }

  return (
    <div>
      <form
        action={async (formData) => {
          setLoading(true);
          setError(null);
          const result = await shareItem(formData);
          if (result.ok) {
            setDone(true);
          } else {
            setError(result.error);
          }
          setLoading(false);
        }}
        className="flex items-center gap-2"
      >
        <input type="hidden" name="itemType" value={itemType} />
        <input type="hidden" name="itemId" value={itemId} />
        <select
          name="recipientId"
          className="rounded border border-line px-1 py-0.5 text-xs"
        >
          {followingList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nickname}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-seal px-2 py-0.5 text-xs text-ink disabled:opacity-50"
        >
          {loading ? "送信中…" : "送る"}
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
