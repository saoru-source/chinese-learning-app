"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { recordAnswer } from "@/lib/quiz/actions";
import type { QuizWord } from "@/lib/quiz/select";

function AnswerButton({ label, className }: { label: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} active:scale-95 transition-transform disabled:opacity-50`}
    >
      {pending ? "送信中…" : label}
    </button>
  );
}

export default function QuizCard({ word }: { word: QuizWord }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded border border-line p-8 text-center">
      <p className="mb-1 text-[14.4px] text-ink-soft">HSK{word.hsk_level}</p>
      <p className="mb-6 text-[43.2px]">{word.hanzi}</p>

      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="rounded bg-seal px-6 py-2 text-[16.8px] text-ink active:scale-95 transition-transform"
        >
          答えを見る
        </button>
      ) : (
        <>
          <p className="mb-1 text-ink-soft">{word.pinyin}</p>
          <p className="mb-6 text-[21.6px]">{word.meaning_ja}</p>
          <div className="flex justify-center gap-4">
            <form action={recordAnswer}>
              <input type="hidden" name="itemId" value={word.id} />
              <input type="hidden" name="correct" value="false" />
              <AnswerButton label="できなかった" className="rounded border border-red-300 px-6 py-2 text-[16.8px] text-red-600" />
            </form>
            <form action={recordAnswer}>
              <input type="hidden" name="itemId" value={word.id} />
              <input type="hidden" name="correct" value="true" />
              <AnswerButton label="できた" className="rounded bg-green-600 px-6 py-2 text-[16.8px] text-white" />
            </form>
          </div>
        </>
      )}
    </div>
  );
}
