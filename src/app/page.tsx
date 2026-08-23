import Link from "next/link";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import GoalCard from "@/components/GoalCard";
import HeroReviewCard from "@/components/HeroReviewCard";

type TileDef = {
  label: string;
  href: string;
  gradient: string;
  icon: ReactNode;
};

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  width: 18,
  height: 18,
  fill: "none",
  stroke: "white",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const AVAILABLE_TILES: TileDef[] = [
  {
    label: "単語一覧",
    href: "/words",
    gradient: "var(--grad)",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    ),
  },
  {
    label: "例文パターン",
    href: "/patterns",
    gradient: "linear-gradient(135deg, var(--jade), var(--jade-deep))",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M4 6h16M4 12h10M4 18h13" />
      </svg>
    ),
  },
  {
    label: "クイズ",
    href: "/study",
    gradient: "linear-gradient(135deg, var(--gold), var(--gold-deep))",
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.9.4-1.4.9-1.4 2" />
        <circle cx="12" cy="17" r="0.6" fill="white" />
      </svg>
    ),
  },
  {
    label: "グループ暗記",
    href: "/groups",
    gradient: "linear-gradient(135deg, var(--lavender), var(--seal-deep))",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="3" y="4" width="8" height="8" rx="2" />
        <rect x="13" y="4" width="8" height="8" rx="2" />
        <rect x="3" y="14" width="8" height="8" rx="2" />
        <rect x="13" y="14" width="8" height="8" rx="2" />
      </svg>
    ),
  },
  {
    label: "長文読解",
    href: "/reading",
    gradient: "linear-gradient(135deg, var(--jade), var(--lavender))",
    icon: (
      <svg {...ICON_PROPS}>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M4 15l4-4 3 3 5-6 4 5" />
      </svg>
    ),
  },
  {
    label: "ライティング",
    href: "/writing",
    gradient: "linear-gradient(135deg, var(--seal), var(--gold))",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" />
      </svg>
    ),
  },
];

const LOCK_ICON = (
  <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="var(--ink-soft)" strokeWidth={2} aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const COMING_SOON_ICON_PROPS = {
  viewBox: "0 0 24 24",
  width: 18,
  height: 18,
  fill: "none",
  stroke: "var(--ink-soft)",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

type ComingSoonTileDef = {
  label: string;
  href: string | null;
  icon: ReactNode;
  wide?: boolean;
};

const COMING_SOON_TILES: ComingSoonTileDef[] = [
  {
    label: "段階的暗記",
    href: null,
    icon: (
      <svg {...COMING_SOON_ICON_PROPS}>
        <rect x="4" y="4" width="16" height="4" rx="1" />
        <rect x="4" y="10" width="16" height="4" rx="1" />
        <rect x="4" y="16" width="16" height="4" rx="1" />
      </svg>
    ),
  },
  {
    label: "ヒアリング",
    href: "/listening",
    icon: (
      <svg {...COMING_SOON_ICON_PROPS}>
        <path d="M4 13a8 8 0 0 1 16 0" />
        <rect x="3" y="13" width="4" height="6" rx="2" />
        <rect x="17" y="13" width="4" height="6" rx="2" />
      </svg>
    ),
  },
  {
    label: "みんなを探す",
    href: null,
    icon: (
      <svg {...COMING_SOON_ICON_PROPS}>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c0-4 3-6 7-6s7 2 7 6" />
      </svg>
    ),
  },
  {
    label: "共有",
    href: null,
    wide: true,
    icon: (
      <svg {...COMING_SOON_ICON_PROPS}>
        <circle cx="6" cy="12" r="2.2" />
        <circle cx="18" cy="6" r="2.2" />
        <circle cx="18" cy="18" r="2.2" />
        <path d="M8 11l8-4M8 13l8 4" />
      </svg>
    ),
  },
];

function AvailableTile({ tile }: { tile: TileDef }) {
  return (
    <Link
      href={tile.href}
      className="active:scale-[0.97] transition-transform"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#fff",
        borderRadius: 18,
        padding: "12px 14px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 12,
          background: tile.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {tile.icon}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{tile.label}</span>
    </Link>
  );
}

function ComingSoonTile({ tile }: { tile: ComingSoonTileDef }) {
  const content = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#fff",
        borderRadius: 18,
        padding: "12px 14px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        position: "relative",
        gridColumn: tile.wide ? "span 2" : undefined,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 12,
          background: "var(--paper-deep)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {tile.icon}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)" }}>{tile.label}</span>
      <span style={{ marginLeft: "auto", flexShrink: 0 }}>{LOCK_ICON}</span>
    </div>
  );

  if (!tile.href) {
    return (
      <div style={{ opacity: 0.55, gridColumn: tile.wide ? "span 2" : undefined }}>{content}</div>
    );
  }

  return (
    <Link
      href={tile.href}
      className="active:scale-[0.97] transition-transform"
      style={{ opacity: 0.55, textDecoration: "none", gridColumn: tile.wide ? "span 2" : undefined }}
    >
      {content}
    </Link>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? (
        await supabase
          .from("users")
          .select("nickname")
          .eq("id", user.id)
          .maybeSingle()
      ).data
    : null;

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">中国語学習アプリ</h1>
        <p className="text-sm text-ink-soft">未ログインです</p>
        <div className="flex gap-3 text-sm">
          <Link href="/login" className="rounded bg-seal px-4 py-2 text-ink">
            ログイン
          </Link>
          <Link href="/signup" className="rounded border border-line px-4 py-2">
            新規登録
          </Link>
        </div>
      </main>
    );
  }

  const displayName = profile?.nickname ?? user.email ?? "";

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <GoalCard />

        <HeroReviewCard displayName={displayName} />

        {!profile?.nickname && (
          <p className="text-center text-xs text-ink-soft">
            <Link href="/profile" className="underline">
              ニックネームを設定する →
            </Link>
          </p>
        )}

        <section>
          <h2 style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 10 }}>
            いつでも使える
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {AVAILABLE_TILES.map((tile) => (
              <AvailableTile key={tile.href} tile={tile} />
            ))}
          </div>
        </section>

        <section>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)" }}>近日公開</h2>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "var(--seal-deep)",
                background: "var(--paper-deep)",
                border: "1px solid var(--line)",
                borderRadius: 999,
                padding: "2px 8px",
              }}
            >
              Coming soon
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {COMING_SOON_TILES.map((tile) => (
              <ComingSoonTile key={tile.label} tile={tile} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
