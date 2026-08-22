"use client";

import { useState } from "react";
import { recordAnswer } from "@/lib/quiz/actions";
import type { QuizWord } from "@/lib/quiz/select";

export default function QuizCard({ word }: { word: QuizWord }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded border border-line p-8 text-center">
      <p className="mb-1 text-xs text-ink-soft">HSK{word.hsk_level}</p>
      <p className="mb-6 text-4xl">{word.hanzi}</p>

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
          <p className="mb-1 text-ink-soft">{word.pinyin}</p>
          <p className="mb-6 text-lg">{word.meaning_ja}</p>
          <div className="flex justify-center gap-4">
            <form action={recordAnswer}>
              <input type="hidden" name="itemId" value={word.id} />
              <input type="hidden" name="correct" value="false" />
              <button
                type="submit"
                className="rounded border border-red-300 px-6 py-2 text-sm text-red-600"
              >
                できなかった
              </button>
            </form>
            <form action={recordAnswer}>
              <input type="hidden" name="itemId" value={word.id} />
              <input type="hidden" name="correct" value="true" />
              <button
                type="submit"
                className="rounded bg-green-600 px-6 py-2 text-sm text-white"
              >
                できた
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
