import Link from "next/link";

export default function WritingPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">ライティング</h1>
        <Link href="/" className="text-sm underline">
          トップに戻る
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href="/writing/scramble"
          className="rounded border border-line p-4"
        >
          <p className="font-bold">語順並べ替え</p>
          <p className="text-sm text-ink-soft">
            バラバラの単語を正しい順番に並べ替える練習
          </p>
        </Link>
        <Link href="/writing/topics" className="rounded border border-line p-4">
          <p className="font-bold">作文のお題</p>
          <p className="text-sm text-ink-soft">
            お題に沿って中国語で書き、AIが添削します
          </p>
        </Link>
      </div>
    </div>
  );
}
