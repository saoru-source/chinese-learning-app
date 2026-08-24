"use client";

import { createContext, useContext, useEffect, useState, useTransition, type ReactNode } from "react";
import { setModeValue } from "./actions";
import { DEFAULT_MODE, isModeKey, type ModeKey } from "./modeMeta";

type ModeContextValue = {
  modeKey: ModeKey;
  setModeKey: (key: ModeKey) => void;
};

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({
  initialMode,
  children,
}: {
  initialMode: string | null;
  children: ReactNode;
}) {
  const [modeKey, setModeKeyState] = useState<ModeKey>(
    isModeKey(initialMode) ? initialMode : DEFAULT_MODE,
  );
  const [, startTransition] = useTransition();

  // data-mode属性の更新がダークモード切り替えの実体(CSS変数の再解決)なので、
  // 状態が変わるたびに<html>へ即時反映する。SSR時点の属性値とも初回は一致する。
  useEffect(() => {
    document.documentElement.setAttribute("data-mode", modeKey);
  }, [modeKey]);

  const setModeKey = (key: ModeKey) => {
    setModeKeyState(key);
    startTransition(() => {
      void setModeValue(key);
    });
  };

  return <ModeContext.Provider value={{ modeKey, setModeKey }}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) {
    throw new Error("useMode must be used within ModeProvider");
  }
  return ctx;
}
