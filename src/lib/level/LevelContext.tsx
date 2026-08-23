"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { setCurrentLevel } from "./actions";
import { DEFAULT_LEVEL, isLevelKey, type LevelKey } from "./levelMeta";

type LevelContextValue = {
  levelKey: LevelKey;
  setLevelKey: (key: LevelKey) => void;
};

const LevelContext = createContext<LevelContextValue | null>(null);

export function LevelProvider({
  initialLevel,
  children,
}: {
  initialLevel: number | null;
  children: ReactNode;
}) {
  const [levelKey, setLevelKeyState] = useState<LevelKey>(
    isLevelKey(initialLevel) ? initialLevel : DEFAULT_LEVEL,
  );
  const [, startTransition] = useTransition();

  const setLevelKey = (key: LevelKey) => {
    setLevelKeyState(key);
    startTransition(() => {
      void setCurrentLevel(key);
    });
  };

  return <LevelContext.Provider value={{ levelKey, setLevelKey }}>{children}</LevelContext.Provider>;
}

export function useLevel() {
  const ctx = useContext(LevelContext);
  if (!ctx) {
    throw new Error("useLevel must be used within LevelProvider");
  }
  return ctx;
}
