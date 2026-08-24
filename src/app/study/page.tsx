import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pickNewWords } from "@/lib/stepwise/select";
import { tokenizeSentence } from "@/lib/words/segment";
import { isLevelKey, DEFAULT_LEVEL } from "@/lib/level/levelMeta";
import StudySession from "./StudySession";

const SESSION_SIZE = 5;

function EmptyCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div
        style={{
          background: "var(--card)",
          borderRadius: 22,
          boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--grad)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28.8,
            margin: "0 auto 16px",
          }}
        >
          {icon}
        </div>
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>{title}</p>
        <div style={{ fontSize: 15.6, color: "var(--ink-soft)", lineHeight: 1.7 }}>{children}</div>
      </div>
    </main>
  );
}

export default async function StudyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("hsk_level")
    .eq("id", user.id)
    .maybeSingle();
  const level = isLevelKey(profile?.hsk_level) ? profile!.hsk_level : DEFAULT_LEVEL;

  const words = await pickNewWords(supabase, user.id, level, SESSION_SIZE);

  if (words.length === 0) {
    return (
      <EmptyCard icon="🎉" title="このレベルの新出単語をすべて学び終えました">
        <p>
          HSK{level}の単語はすべて学習済みです。
          <Link href="/words" className="underline">
            単語一覧
          </Link>
          で復習するか、レベルを変更してみましょう。
        </p>
      </EmptyCard>
    );
  }

  const items = await Promise.all(
    words.map(async (word) => {
      const { data: exampleRows } = await supabase
        .from("sentences")
        .select("hanzi, pinyin, meaning_ja")
        .ilike("hanzi", `%${word.hanzi}%`)
        .order("hsk_level", { ascending: true })
        .order("id", { ascending: true })
        .limit(1);

      const example = exampleRows?.[0] ?? null;
      const exampleSegments = example ? await tokenizeSentence(supabase, example.hanzi) : null;

      return { word, example, exampleSegments };
    }),
  );

  return <StudySession key={words.map((w) => w.id).join("-")} items={items} />;
}
