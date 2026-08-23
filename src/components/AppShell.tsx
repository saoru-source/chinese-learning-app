"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { useTheme } from "@/lib/theme/ThemeContext";
import { THEME_KEYS, THEME_META } from "@/lib/theme/themeMeta";

const NAV = [
  { zh: "家", label: "ホーム", path: "/" },
  { zh: "词", label: "単語", path: "/words" },
  { zh: "试", label: "学習", path: "/quiz/ai" },
  { zh: "听", label: "リスニング", path: "/listening" },
  { zh: "我", label: "マイページ", path: "/profile" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { themeKey, setThemeKey } = useTheme();
  const [themeOpen, setThemeOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          background: "var(--paper)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <div
            style={{
              width: 30,
              height: 30,
              background: "var(--grad)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 15,
              borderRadius: 10,
              transform: "rotate(-3deg)",
            }}
          >
            学
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>中文一途</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {THEME_KEYS.map((key) => (
              <motion.button
                key={key}
                type="button"
                whileTap={{ scale: 0.75 }}
                onClick={() => setThemeKey(key)}
                title={THEME_META[key].label}
                aria-label={`テーマを${THEME_META[key].label}に切り替え`}
                style={{
                  width: key === themeKey ? 10 : 7,
                  height: key === themeKey ? 10 : 7,
                  borderRadius: "50%",
                  background: THEME_META[key].swatch[0],
                  border: key === themeKey ? "2px solid var(--ink)" : "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "width 0.2s ease, height 0.2s ease",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setThemeOpen((v) => !v)}
            aria-label="テーマ設定を開く"
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "var(--grad)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            さ
          </motion.button>
        </div>
      </header>

      <AnimatePresence>
        {themeOpen && (
          <>
            <div
              onClick={() => setThemeOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 40 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{
                position: "fixed",
                top: 58,
                right: 16,
                background: "var(--paper)",
                borderRadius: 20,
                padding: "14px 16px",
                zIndex: 50,
                boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                minWidth: 200,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", letterSpacing: "0.08em" }}>
                  テーマ
                </span>
                <button
                  type="button"
                  onClick={() => setThemeOpen(false)}
                  aria-label="閉じる"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--ink-soft)",
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              {THEME_KEYS.map((key) => (
                <motion.button
                  key={key}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setThemeKey(key);
                    setThemeOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "9px 10px",
                    borderRadius: 12,
                    background: key === themeKey ? "var(--paper-deep)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    marginBottom: 2,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 2,
                      width: 28,
                      height: 14,
                      borderRadius: 7,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {THEME_META[key].swatch.map((c) => (
                      <span key={c} style={{ flex: 1, background: c }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: key === themeKey ? 700 : 400, color: "var(--ink)" }}>
                    {THEME_META[key].label}
                  </span>
                  {key === themeKey && (
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--seal)" }}>✓</span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, paddingBottom: 64 }}>{children}</div>

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--paper)",
          boxShadow: "0 -2px 16px rgba(0,0,0,0.08)",
          zIndex: 30,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div style={{ display: "flex", maxWidth: 480, margin: "0 auto" }}>
          {NAV.map((item) => {
            const active = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className="active:scale-90"
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "7px 0 5px",
                  textDecoration: "none",
                  position: "relative",
                  transition: "transform 0.1s ease",
                }}
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    style={{
                      position: "absolute",
                      top: 3,
                      width: 46,
                      height: 38,
                      borderRadius: 14,
                      background: "var(--paper-deep)",
                      border: "1px solid var(--line)",
                      zIndex: -1,
                    }}
                  />
                )}
                <span
                  style={{
                    fontSize: 18,
                    lineHeight: 1,
                    marginBottom: 2,
                    color: active ? "var(--seal)" : "var(--ink-soft)",
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.zh}
                </span>
                <span
                  style={{
                    fontSize: 8.5,
                    color: active ? "var(--seal-deep)" : "var(--ink-soft)",
                    fontWeight: active ? 700 : 400,
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
