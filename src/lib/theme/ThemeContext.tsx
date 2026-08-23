"use client";

import { createContext, useContext, useEffect, useState, useTransition, type ReactNode } from "react";
import { setThemeValue } from "./actions";
import { DEFAULT_THEME, isThemeKey, type ThemeKey } from "./themeMeta";

type ThemeContextValue = {
  themeKey: ThemeKey;
  setThemeKey: (key: ThemeKey) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: string | null;
  children: ReactNode;
}) {
  const [themeKey, setThemeKeyState] = useState<ThemeKey>(
    isThemeKey(initialTheme) ? initialTheme : DEFAULT_THEME,
  );
  const [, startTransition] = useTransition();

  // data-theme属性の更新がテーマ切り替えの実体(CSS変数の再解決)なので、
  // 状態が変わるたびに<html>へ即時反映する。SSR時点の属性値とも初回は一致する。
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeKey);
  }, [themeKey]);

  const setThemeKey = (key: ThemeKey) => {
    setThemeKeyState(key);
    startTransition(() => {
      void setThemeValue(key);
    });
  };

  return <ThemeContext.Provider value={{ themeKey, setThemeKey }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
