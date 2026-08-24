"use client";

import { useEffect, useState } from "react";
import { useLevel } from "@/lib/level/LevelContext";
import { getWordDictionaryPage, type DictionaryWord } from "@/lib/words/dictionaryActions";

export default function WordDictionaryGrid() {
  const { levelKey } = useLevel();
  const [page, setPage] = useState(1);

  // レベルが切り替わったら1ページ目に戻す(レンダー中にstateを調整する
  // Reactの推奨パターン。useEffect内でのsetStateは避ける)
  const [prevLevelKey, setPrevLevelKey] = useState(levelKey);
  if (levelKey !== prevLevelKey) {
    setPrevLevelKey(levelKey);
    setPage(1);
  }

  const [items, setItems] = useState<DictionaryWord[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(60);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const requestKey = `${levelKey}:${page}`;
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let cancelled = false;
    getWordDictionaryPage(levelKey, page).then((result) => {
      if (cancelled) return;
      setItems(result.items);
      setTotal(result.total);
      setPageSize(result.pageSize);
      setLoadedKey(requestKey);
    });
    return () => {
      cancelled = true;
    };
  }, [levelKey, page, requestKey]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <p style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 12 }}>
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
                fontSize: 20,
                fontWeight: 700,
                color: "var(--ink)",
                opacity: w.studied ? 1 : 0.35,
              }}
            >
              {w.hanzi}
            </div>
            {w.studied ? (
              <>
                <div style={{ fontSize: 10, color: "var(--ink-soft)", marginTop: 2 }}>{w.pinyin}</div>
                <div
                  style={{
                    fontSize: 10,
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
              <div style={{ fontSize: 10, color: "var(--ink-soft)", opacity: 0.5, marginTop: 2 }}>？？？</div>
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
            fontSize: 13,
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
        <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          style={{
            fontSize: 13,
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
