"use client";

import { useTheme } from "@/lib/theme/ThemeContext";
import { THEME_KEYS, THEME_META } from "@/lib/theme/themeMeta";

export default function ThemeSwitcher() {
  const { themeKey, setThemeKey } = useTheme();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {THEME_KEYS.map((key) => {
        const active = themeKey === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setThemeKey(key)}
            style={{
              textAlign: "left",
              background: "#fff",
              borderRadius: 14,
              padding: "12px 14px",
              border: active ? "2px solid var(--seal)" : "1px solid var(--line)",
              boxShadow: active ? "0 4px 14px rgba(0,0,0,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              {THEME_META[key].swatch.map((c, i) => (
                <span
                  key={i}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: c,
                    border: "1px solid rgba(0,0,0,0.06)",
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: "var(--ink)" }}>
              {THEME_META[key].label}
            </span>
            {active && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--seal)" }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}
