import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  label: string;
  icon: ReactNode;
  gradient: string;
  href?: string;
  badge?: string;
};

// ホーム画面(src/app/page.tsx)の「いつでも使える」タイルと見た目を揃えた
// 汎用タイル。href省略時は「近日公開」等の非活性表示になる。
export default function MenuTile({ label, icon, gradient, href, badge }: Props) {
  const iconBox = (
    <div
      style={{
        flexShrink: 0,
        width: 36,
        height: 36,
        borderRadius: 12,
        background: href ? gradient : "var(--paper-deep)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </div>
  );

  const content = (
    <>
      {iconBox}
      <span style={{ fontSize: 14.4, fontWeight: 700, color: href ? "var(--ink)" : "var(--ink-soft)" }}>
        {label}
      </span>
      {badge && (
        <span
          style={{
            marginLeft: "auto",
            flexShrink: 0,
            fontSize: 10.8,
            fontWeight: 700,
            color: "var(--ink)",
            background: "var(--paper-deep)",
            border: "1px solid var(--line)",
            borderRadius: 999,
            padding: "2px 8px",
          }}
        >
          {badge}
        </span>
      )}
    </>
  );

  const style = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "var(--card)",
    borderRadius: 18,
    padding: "12px 14px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
    textDecoration: "none",
  } as const;

  if (!href) {
    return (
      <div style={{ ...style, opacity: 0.55 }}>{content}</div>
    );
  }

  return (
    <Link href={href} className="active:scale-[0.97] transition-transform" style={style}>
      {content}
    </Link>
  );
}
