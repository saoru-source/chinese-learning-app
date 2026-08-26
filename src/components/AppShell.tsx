"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { useTheme } from "@/lib/theme/ThemeContext";
import { THEME_KEYS, THEME_META } from "@/lib/theme/themeMeta";
import { useLevel } from "@/lib/level/LevelContext";
import { LEVEL_KEYS, LEVEL_META } from "@/lib/level/levelMeta";
import { useMode } from "@/lib/mode/ModeContext";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

const NAV = [
  { zh: "家", label: "ホーム", path: "/" },
  { zh: "试", label: "学習", path: "/learn" },
  { zh: "典", label: "辞書", path: "/learn/dictionary" },
  { zh: "测", label: "テスト", path: "/milestones" },
  { zh: "我", label: "マイページ", path: "/profile" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { themeKey, setThemeKey } = useTheme();
  const [themeOpen, setThemeOpen] = useState(false);
  const { levelKey, setLevelKey } = useLevel();
  const [levelOpen, setLevelOpen] = useState(false);
  const { modeKey, setModeKey } = useMode();
  const pathname = usePathname();

  // /learn/dictionaryは/learnの下位パスなので、startsWithの単純比較だと
  // 学習タブと辞書タブが同時にactiveになってしまう。最も長く一致した
  // パスのタブだけをactiveにする。
  const activeNavPath = NAV.filter((n) =>
    n.path === "/" ? pathname === "/" : pathname.startsWith(n.path),
  ).sort((a, b) => b.path.length - a.path.length)[0]?.path;

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
              fontSize: 18,
              borderRadius: 10,
              transform: "rotate(-3deg)",
            }}
          >
            学
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "var(--ink)" }}>中文一途</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setLevelOpen((v) => !v)}
            aria-label="HSKレベルを切り替え"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 24,
              padding: "0 10px",
              borderRadius: 999,
              background: "var(--paper-deep)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
              fontSize: 13.2,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {LEVEL_META[levelKey].label}
          </motion.button>
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
              fontSize: 14.4,
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
                <span style={{ fontSize: 13.2, fontWeight: 700, color: "var(--ink-soft)", letterSpacing: "0.08em" }}>
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
                    fontSize: 19.2,
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
                  <span style={{ fontSize: 14.4, fontWeight: key === themeKey ? 700 : 400, color: "var(--ink)" }}>
                    {THEME_META[key].label}
                  </span>
                  {key === themeKey && (
                    <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--seal)" }}>✓</span>
                  )}
                </motion.button>
              ))}

              <div style={{ borderTop: "1px solid var(--line)", marginTop: 10, paddingTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14.4, fontWeight: 700, color: "var(--ink)" }}>
                    {modeKey === "dark" ? <MoonIcon /> : <SunIcon />}
                    {modeKey === "dark" ? "ダークモード" : "ライトモード"}
                  </span>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setModeKey(modeKey === "dark" ? "light" : "dark")}
                    aria-label={modeKey === "dark" ? "ライトモードに切り替え" : "ダークモードに切り替え"}
                    role="switch"
                    aria-checked={modeKey === "dark"}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 999,
                      background: modeKey === "dark" ? "var(--grad)" : "var(--paper-deep)",
                      border: "1px solid var(--line)",
                      position: "relative",
                      cursor: "pointer",
                      padding: 0,
                      flexShrink: 0,
                    }}
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{
                        position: "absolute",
                        top: 2,
                        left: modeKey === "dark" ? 22 : 2,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#fff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      }}
                    />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {levelOpen && (
          <>
            <div
              onClick={() => setLevelOpen(false)}
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
                minWidth: 160,
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
                <span style={{ fontSize: 13.2, fontWeight: 700, color: "var(--ink-soft)", letterSpacing: "0.08em" }}>
                  HSKレベル
                </span>
                <button
                  type="button"
                  onClick={() => setLevelOpen(false)}
                  aria-label="閉じる"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--ink-soft)",
                    fontSize: 19.2,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              {LEVEL_KEYS.map((key) => (
                <motion.button
                  key={key}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setLevelKey(key);
                    setLevelOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "9px 10px",
                    borderRadius: 12,
                    background: key === levelKey ? "var(--paper-deep)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    marginBottom: 2,
                  }}
                >
                  <span style={{ fontSize: 14.4, fontWeight: key === levelKey ? 700 : 400, color: "var(--ink)" }}>
                    {LEVEL_META[key].label}
                  </span>
                  {key === levelKey && (
                    <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--seal)" }}>✓</span>
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
            const active = activeNavPath === item.path;
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
                    fontSize: 21.6,
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
                    fontSize: 10.2,
                    color: active ? "var(--ink)" : "var(--ink-soft)",
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
