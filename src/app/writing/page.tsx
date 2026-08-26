import Link from "next/link";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="var(--ink-soft)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="var(--ink-soft)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function BookIcon({ stroke = "white" }: { stroke?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15z" />
      <path d="M4 18a2.5 2.5 0 0 1 2.5-2.5H20" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M21 16l-5.5-5.5L4 21" />
    </svg>
  );
}

function GrammarPatternIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9h10M7 13h6" />
    </svg>
  );
}

function ModeCard({
  href,
  iconBg,
  icon,
  title,
  subtitle,
}: {
  href: string;
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="active:scale-[0.98] transition-transform"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        background: "var(--card)",
        borderRadius: 18,
        padding: "16px 16px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: 12,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 16.8, fontWeight: 700, color: "var(--ink)" }}>{title}</p>
        <p style={{ fontSize: 13.2, color: "var(--ink-soft)", marginTop: 2, lineHeight: 1.5 }}>{subtitle}</p>
      </div>
      <div style={{ flexShrink: 0, marginTop: 12 }}>
        <ChevronRightIcon />
      </div>
    </Link>
  );
}

export default function WritingPage() {
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/" aria-label="トップに戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 19.2, fontWeight: 700, color: "var(--ink)" }}>書く</h1>
      </div>

      <p style={{ fontSize: 14.4, color: "var(--ink-soft)", marginBottom: 16, lineHeight: 1.6 }}>
        日本語を介さず、中国語のまま発想して書く練習です。取り組みたいモードを選んでください。
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <ModeCard
          href="/writing/scramble"
          iconBg="var(--grad)"
          icon={<ShuffleIcon />}
          title="語順並べ替え"
          subtitle="バラバラの単語を正しい順番に並べ替える練習"
        />
        <ModeCard
          href="/writing/topics"
          iconBg="var(--grad)"
          icon={<PencilIcon />}
          title="作文のお題"
          subtitle="自由作文・場面設定のお題に沿って中国語で書き、AIが添削します"
        />
        <ModeCard
          href="/reading"
          iconBg="var(--grad)"
          icon={<BookIcon />}
          title="長文要約"
          subtitle="長文読解で読んだ文章を、自分の言葉で中国語のまま要約します（要約は各長文のページから）"
        />

        <ModeCard
          href="/writing/image"
          iconBg="var(--grad)"
          icon={<ImageIcon />}
          title="画像描写"
          subtitle="画像を見て、その内容を中国語で説明します"
        />
        <ModeCard
          href="/writing/grammar"
          iconBg="var(--grad)"
          icon={<GrammarPatternIcon />}
          title="文法の型で例文添削"
          subtitle="指定された文法パターンを使って自分で例文を作り、AIが添削します"
        />
      </div>
    </main>
  );
}
