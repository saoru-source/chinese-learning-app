"use client";

import { useTheme } from "@/lib/theme/ThemeContext";
import { THEME_KEYS, THEME_META } from "@/lib/theme/themeMeta";

export default function ThemeSwitcher() {
  const { themeKey, setThemeKey } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-3">
      {THEME_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => setThemeKey(key)}
          className={`w-full rounded border p-3 text-left text-xs ${
            themeKey === key ? "border-seal ring-2 ring-seal" : "border-line"
          }`}
        >
          <div className="mb-2 flex gap-1">
            {THEME_META[key].swatch.map((c) => (
              <span
                key={c}
                className="h-5 w-5 rounded-full border border-black/10"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          {THEME_META[key].label}
        </button>
      ))}
    </div>
  );
}
