"use client";

import { setTheme } from "@/lib/theme/actions";

const THEMES: { key: string; label: string; swatch: [string, string, string] }[] = [
  { key: "yebe", label: "パステルイエベ", swatch: ["#F2A0AE", "#C9B8E8", "#F6C863"] },
  { key: "burube", label: "パステルブルベ", swatch: ["#93AEEB", "#8FE0B8", "#F3E27A"] },
  { key: "nordic", label: "北欧カラー", swatch: ["#7FA0A8", "#CC9F3B", "#B06A50"] },
  { key: "jirai", label: "地雷カラー", swatch: ["#E85D8A", "#7A5B99", "#2A2430"] },
];

export default function ThemeSwitcher({ current }: { current: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {THEMES.map((t) => (
        <form key={t.key} action={setTheme}>
          <input type="hidden" name="theme" value={t.key} />
          <button
            type="submit"
            className={`w-full rounded border p-3 text-left text-xs ${
              current === t.key ? "border-seal ring-2 ring-seal" : "border-line"
            }`}
          >
            <div className="mb-2 flex gap-1">
              {t.swatch.map((c) => (
                <span
                  key={c}
                  className="h-5 w-5 rounded-full border border-black/10"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            {t.label}
          </button>
        </form>
      ))}
    </div>
  );
}
