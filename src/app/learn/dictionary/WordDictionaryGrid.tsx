"use client";

import { useEffect, useState } from "react";
import { useLevel } from "@/lib/level/LevelContext";
import { LEVEL_KEYS, LEVEL_META } from "@/lib/level/levelMeta";
import { getWordDictionaryPage, type DictionaryWord, type SortMode } from "@/lib/words/dictionaryActions";

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: "level", label: "レベル順" },
  { key: "pinyin", label: "ピンイン順" },
  { key: "studied", label: "未学習優先" },
];

export default function WordDictionaryGrid() {
  const { levelKey, setLevelKey } = useLevel();
  const [sortMode, setSortMode] = useState<SortMode>("level");
  const [page, setPage] = useState(1);

  // レベルが切り替わったら1ページ目に戻す(並び替えモードは維持する。
  // レンダー中にstateを調整するReactの推奨パターン。useEffect内でのsetStateは避ける)
  const [prevLevelKey, setPrevLevelKey] = useState(levelKey);
  if (levelKey !== prevLevelKey) {
    setPrevLevelKey(levelKey);
    setPage(1);
  }

  function handleSortChange(mode: SortMode) {
    if (mode === sortMode) return;
    setSortMode(mode);
    setPage(1);
  }

  const [items, setItems] = useState<DictionaryWord[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(60);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const requestKey = `${levelKey}:${sortMode}:${page}`;
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let cancelled = false;
    getWordDictionaryPage(levelKey, page, sortMode).then((result) => {
      if (cancelled) return;
      setItems(result.items);
      setTotal(result.total);
      setPageSize(result.pageSize);
      setLoadedKey(requestKey);
    });
    return () => {
      cancelled = true;
    };
  }, [levelKey, page, sortMode, requestKey]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {LEVEL_KEYS.map((lv) => (
          <button
            key={lv}
            type="button"
            onClick={() => setLevelKey(lv)}
            style={{
              fontSize: 13.2,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              color: lv === levelKey ? "#fff" : "var(--ink-soft)",
              background: lv === levelKey ? "var(--grad)" : "var(--paper-deep)",
            }}
          >
            {LEVEL_META[lv].label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          background: "var(--paper-deep)",
          borderRadius: 999,
          padding: 4,
          marginBottom: 12,
        }}
      >
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => handleSortChange(opt.key)}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "7px 0",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontSize: 13.2,
              fontWeight: opt.key === sortMode ? 700 : 400,
              color: opt.key === sortMode ? "var(--ink)" : "var(--ink-soft)",
              background: opt.key === sortMode ? "var(--card)" : "transparent",
              boxShadow: opt.key === sortMode ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 14.4, color: "var(--ink-soft)", marginBottom: 12 }}>
        HSK{levelKey} · 全{total}語
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          opacity: loading ? 0.5 : 1,
          transition: "opacity 0.15s ease",
          minHeight: 200,
        }}
      >
        {items.map((w) => (
          <div
            key={w.id}
            style={{
              background: "var(--card)",
              borderRadius: 14,
              padding: "10px 6px",
              textAlign: "center",
              boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "var(--ink)",
                opacity: w.studied ? 1 : 0.35,
              }}
            >
              {w.hanzi}
            </div>
            {w.studied ? (
              <>
                <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>{w.pinyin}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ink)",
                    marginTop: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {w.meaning_ja}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: "var(--ink-soft)", opacity: 0.5, marginTop: 2 }}>？？？</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 20 }}>
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          style={{
            fontSize: 15.6,
            fontWeight: 700,
            color: "var(--ink)",
            opacity: page <= 1 ? 0.35 : 1,
            background: "none",
            border: "none",
            cursor: page <= 1 ? "default" : "pointer",
          }}
        >
          前へ
        </button>
        <span style={{ fontSize: 14.4, color: "var(--ink-soft)" }}>
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          style={{
            fontSize: 15.6,
            fontWeight: 700,
            color: "var(--ink)",
            opacity: page >= totalPages ? 0.35 : 1,
            background: "none",
            border: "none",
            cursor: page >= totalPages ? "default" : "pointer",
          }}
        >
          次へ
        </button>
      </div>
    </div>
  );
}
