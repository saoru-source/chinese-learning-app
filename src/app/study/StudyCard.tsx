"use client";

import { useState } from "react";
import { recordStepwiseResult } from "@/lib/stepwise/actions";
import type { StepwiseSentence } from "@/lib/stepwise/select";

export default function StudyCard({
  sentence,
}: {
  sentence: StepwiseSentence;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded border border-line p-8 text-center">
      <p className="mb-1 text-xs text-ink-soft">HSK{sentence.hsk_level}</p>
      <p className="mb-4 text-2xl">{sentence.hanzi}</p>

      {sentence.knownWords.length > 0 && (
        <div className="mb-4 flex flex-wrap justify-center gap-1">
          {sentence.knownWords.map((w) => (
            <span
              key={w}
              className="rounded bg-jade/20 px-2 py-0.5 text-xs text-ink"
            >
              {w}
            </span>
          ))}
        </div>
      )}

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
          <p className="mb-1 text-ink-soft">{sentence.pinyin}</p>
          <p className="mb-6 text-lg">{sentence.meaning_ja}</p>
          <div className="flex justify-center gap-4">
            <form action={recordStepwiseResult}>
              <input type="hidden" name="itemId" value={sentence.id} />
              <input type="hidden" name="correct" value="false" />
              <button
                type="submit"
                className="rounded border border-red-300 px-6 py-2 text-sm text-red-600"
              >
                できなかった
              </button>
            </form>
            <form action={recordStepwiseResult}>
              <input type="hidden" name="itemId" value={sentence.id} />
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
