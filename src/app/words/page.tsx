import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { tokenizeSentence } from "@/lib/words/segment";
import BookmarkToggle from "@/components/BookmarkToggle";
import SpeakButton from "@/components/SpeakButton";
import PronunciationCheck from "@/components/PronunciationCheck";
import TappableText from "@/components/TappableText";

const LEVELS = [1, 2, 3, 4, 5, 6];

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="var(--jade-deep)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="white" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

function RewindIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

function CompletionScreen({
  level,
  words,
}: {
  level: number;
  words: { id: number; hanzi: string; pinyin: string | null; meaning_ja: string | null }[];
}) {
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 40px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            background: "var(--grad)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1.1,
          }}
        >
          {words.length}語
        </div>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 4 }}>
          すべての単語を確認しました
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          padding: "4px 16px",
          marginBottom: 20,
        }}
      >
        {words.map((w, i) => (
          <div
            key={w.id}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              padding: "12px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--line)",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{w.hanzi}</span>
            <span style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 500 }}>{w.pinyin}</span>
            <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--ink)", textAlign: "right" }}>
              {w.meaning_ja}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Link
          href={`/words?level=${level}&index=0`}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: 999,
            padding: "12px 0",
            fontSize: 13,
            fontWeight: 700,
            color: "var(--ink)",
            textDecoration: "none",
          }}
        >
          <RewindIcon />
          もう一度
        </Link>
        <Link
          href="/"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--grad)",
            borderRadius: 999,
            padding: "12px 0",
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            textDecoration: "none",
          }}
        >
          ホームへ
        </Link>
      </div>
    </main>
  );
}

export default async function WordsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; index?: string }>;
}) {
  const params = await searchParams;
  const level = LEVELS.includes(Number(params.level)) ? Number(params.level) : 1;
  const index = Math.max(0, Number(params.index) || 0);

  const supabase = await createClient();

  const { count } = await supabase
    .from("words")
    .select("id", { count: "exact", head: true })
    .eq("hsk_level", level);

  const total = count ?? 0;

  if (index >= total) {
    const { data: allWords } = await supabase
      .from("words")
      .select("id, hanzi, pinyin, meaning_ja")
      .eq("hsk_level", level)
      .order("id", { ascending: true });

    return <CompletionScreen level={level} words={allWords ?? []} />;
  }

  const { data: wordRows } = await supabase
    .from("words")
    .select("id, hanzi, pinyin, meaning_ja, hsk_level")
    .eq("hsk_level", level)
    .order("id", { ascending: true })
    .range(index, index);

  const word = wordRows?.[0];

  if (!word) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
        <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>単語が見つかりませんでした。</p>
        <Link href="/" className="underline text-sm">トップに戻る</Link>
      </main>
    );
  }

  // 単語辞書(/learn/dictionary)の「学習済み」判定用。カードとして表示された単語を
  // progressテーブルに記録する(item_type="word")。既存の行(クイズの正誤記録等)を
  // 上書きしないよう、ignoreDuplicatesで「まだ無ければ挿入するだけ」にしている。
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("progress").upsert(
      {
        user_id: user.id,
        item_type: "word",
        item_id: word.id,
        correct_count: 0,
        incorrect_count: 0,
        last_studied_at: new Date().toISOString(),
      },
      { onConflict: "user_id,item_type,item_id", ignoreDuplicates: true },
    );
  }

  const { data: exampleRows } = await supabase
    .from("sentences")
    .select("id, hanzi, pinyin, meaning_ja, grammar_label_raw")
    .ilike("hanzi", `%${word.hanzi}%`)
    .order("hsk_level", { ascending: true })
    .order("id", { ascending: true })
    .limit(1);

  const example = exampleRows?.[0] ?? null;
  const exampleSegments = example ? await tokenizeSentence(supabase, example.hanzi) : null;

  const progressPct = Math.round(((index + 1) / total) * 100);

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {LEVELS.map((lv) => (
          <Link
            key={lv}
            href={`/words?level=${lv}&index=0`}
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 999,
              textDecoration: "none",
              color: lv === level ? "#fff" : "var(--ink-soft)",
              background: lv === level ? "var(--grad)" : "var(--paper-deep)",
            }}
          >
            HSK{lv}
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Link
          href="/"
          aria-label="トップに戻る"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            flexShrink: 0,
          }}
        >
          <BackArrowIcon />
        </Link>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)" }}>
          単語学習 · HSK{word.hsk_level}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-soft)" }}>
          {index + 1} / {total} 語
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "3px 9px",
            borderRadius: 8,
            background: "var(--grad)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            transform: "rotate(-4deg)",
            flexShrink: 0,
          }}
        >
          HSK{word.hsk_level}
        </span>
      </div>

      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "var(--line)",
          overflow: "hidden",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            background: "var(--grad)",
            borderRadius: 999,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          background: "#fff",
          borderRadius: 22,
          boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
          padding: "12px 16px",
          textAlign: "center",
          marginBottom: 18,
        }}
      >
        <BookmarkToggle />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 }}>
          <SpeakButton text={word.hanzi} size={36} layout="column" />
          <span style={{ fontSize: 38, fontWeight: 700, color: "var(--ink)" }}>{word.hanzi}</span>
          <PronunciationCheck target={word.hanzi} pinyin={word.pinyin} />
        </div>

        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-soft)", marginBottom: 6 }}>
          {word.pinyin}
        </p>

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 6 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 2 }}>意味</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>{word.meaning_ja}</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, marginBottom: 20 }}>
        <Link
          href={index > 0 ? `/words?level=${level}&index=${index - 1}` : "#"}
          aria-disabled={index === 0}
          tabIndex={index === 0 ? -1 : undefined}
          className="active:scale-90 transition-transform"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            opacity: index === 0 ? 0.35 : 1,
            pointerEvents: index === 0 ? "none" : "auto",
          }}
        >
          <ArrowLeftIcon />
        </Link>
        <Link
          href={`/words?level=${level}&index=${index + 1}`}
          className="active:scale-90 transition-transform"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--grad)",
            boxShadow: "0 6px 18px rgba(0,0,0,0.14)",
          }}
        >
          <ArrowRightIcon />
        </Link>
      </div>

      {example && exampleSegments && (
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            padding: "18px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <TappableText segments={exampleSegments} fontSize={16} lineHeight={1.7} />
            </div>
            <SpeakButton text={example.hanzi} size={26} />
          </div>

          <p style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 500, marginTop: 8 }}>
            {example.pinyin}
          </p>
          <p style={{ fontSize: 14, color: "var(--ink)", marginTop: 4 }}>{example.meaning_ja}</p>

          {example.grammar_label_raw && (
            <span
              style={{
                display: "inline-flex",
                marginTop: 10,
                padding: "4px 12px",
                borderRadius: 999,
                background: "var(--grad)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {example.grammar_label_raw}
            </span>
          )}
        </div>
      )}
    </main>
  );
}
