"use client";

import { useState } from "react";
import Link from "next/link";

type Question = {
  id: number;
  hsk_level: number;
  words_shuffled: string[];
  correct_sentence: string;
  meaning_ja: string | null;
};

export default function ScrambleCard({ question }: { question: Question }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded border border-line p-8 text-center">
      <p className="mb-4 text-xs text-ink-soft">HSK{question.hsk_level}</p>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {question.words_shuffled.map((w, i) => (
          <span
            key={i}
            className="rounded border border-line bg-paper-deep px-3 py-2 text-lg"
          >
            {w}
          </span>
        ))}
      </div>

      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="rounded bg-seal px-6 py-2 text-sm text-ink"
        >
          答えを見る
        </button>
      ) : (
        <>
          <p className="mb-1 text-lg">{question.correct_sentence}</p>
          {question.meaning_ja && (
            <p className="mb-6 text-sm text-ink-soft">
              {question.meaning_ja}
            </p>
          )}
        </>
      )}

      <div className="mt-6">
        <Link href="/writing/scramble" className="text-sm underline">
          次の問題へ
        </Link>
      </div>
    </div>
  );
}
