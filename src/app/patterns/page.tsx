import Link from "next/link";

const COLLOQUIAL_SITUATIONS = [
  "友達との約束",
  "買い物・値段交渉",
  "体調不良・病院",
  "レストラン・注文",
  "道を尋ねる",
  "SNS・チャット表現",
];

const BUSINESS_SITUATIONS = [
  "メールの書き出し・結び",
  "会議での発言",
  "依頼・お願い",
  "謝罪・お詫び",
  "自己紹介・名刺交換",
  "電話応対",
];

export default function PatternsPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">例文パターン集</h1>
        <Link href="/" className="text-sm underline">
          トップに戻る
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold text-ink-soft">
          口語（日常会話）
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {COLLOQUIAL_SITUATIONS.map((s) => (
            <Link
              key={s}
              href={`/patterns/colloquial/${encodeURIComponent(s)}`}
              className="rounded border border-line p-4 text-center text-sm"
            >
              {s}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-ink-soft">
          ビジネス（硬文）
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {BUSINESS_SITUATIONS.map((s) => (
            <Link
              key={s}
              href={`/patterns/business/${encodeURIComponent(s)}`}
              className="rounded border border-line p-4 text-center text-sm"
            >
              {s}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
