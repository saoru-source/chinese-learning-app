import Link from "next/link";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink-soft)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

// 「選択式」「ディクテーション」は/listening/choiceと/listening/dictationという
// 別ルートとして既に実装されているため、タブの見た目のままページ遷移になる
// (クライアント側のタブ切り替えstateは持たない)。
export default function ListeningHeader({
  active,
  hskLevel,
  current,
  total,
}: {
  active: "choice" | "dictation";
  hskLevel: number;
  current: number;
  total: number;
}) {
  const progressPct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/" aria-label="トップに戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>ヒアリング</h1>
      </div>

      <div
        style={{
          display: "flex",
          background: "var(--paper-deep)",
          borderRadius: 999,
          padding: 4,
          marginBottom: 16,
        }}
      >
        <Link
          href="/listening/choice"
          style={{
            flex: 1,
            textAlign: "center",
            padding: "8px 0",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: active === "choice" ? 600 : 400,
            color: active === "choice" ? "var(--ink)" : "var(--ink-soft)",
            background: active === "choice" ? "#fff" : "transparent",
            boxShadow: active === "choice" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
            textDecoration: "none",
          }}
        >
          選択式
        </Link>
        <Link
          href="/listening/dictation"
          style={{
            flex: 1,
            textAlign: "center",
            padding: "8px 0",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: active === "dictation" ? 600 : 400,
            color: active === "dictation" ? "var(--ink)" : "var(--ink-soft)",
            background: active === "dictation" ? "#fff" : "transparent",
            boxShadow: active === "dictation" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
            textDecoration: "none",
          }}
        >
          ディクテーション
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span
          style={{
            flexShrink: 0,
            background: "var(--grad)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 10,
            borderRadius: 6,
            padding: "3px 10px",
          }}
        >
          HSK{hskLevel}
        </span>
        <span style={{ flexShrink: 0, fontSize: 12, color: "var(--ink-soft)" }}>
          問{current} / {total}問
        </span>
        <div style={{ flex: 1, height: 4, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "var(--grad)",
              borderRadius: 999,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    </>
  );
}
