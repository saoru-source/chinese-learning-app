import Link from "next/link";

export default function ListeningPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">ヒアリング</h1>
        <Link href="/" className="text-sm underline">
          トップに戻る
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <Link href="/listening/choice" className="rounded border border-line p-4">
          <p className="font-bold">選択式</p>
          <p className="text-sm text-ink-soft">
            音声を聞いて、意味の選択肢から正解を選ぶ
          </p>
        </Link>
        <Link href="/listening/dictation" className="rounded border border-line p-4">
          <p className="font-bold">ディクテーション</p>
          <p className="text-sm text-ink-soft">
            音声を聞いて、聞き取った中国語を入力する
          </p>
        </Link>
      </div>
    </div>
  );
}
