import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pickStepwiseSession } from "@/lib/stepwise/select";
import { tokenizeSentence } from "@/lib/words/segment";
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

  const { sentences, knownWordCount } = await pickStepwiseSession(supabase, user.id, SESSION_SIZE);

  if (sentences.length === 0) {
    if (knownWordCount === 0) {
      return (
        <EmptyCard icon="📖" title="まだ覚えた単語がありません">
          <p>
            まず
            <Link href="/quiz/ai" className="underline">
              クイズ
            </Link>
            で単語を学習してみましょう。
          </p>
        </EmptyCard>
      );
    }
    return (
      <EmptyCard icon="🔍" title="出題できる例文が見つかりませんでした">
        <p>
          今の既習単語({knownWordCount}語)を使える新しい例文が見つかりませんでした。もう少し単語を覚えると出題できる例文が増えます。
        </p>
      </EmptyCard>
    );
  }

  const items = await Promise.all(
    sentences.map(async (sentence) => ({
      sentence,
      segments: await tokenizeSentence(supabase, sentence.hanzi),
    })),
  );

  return <StudySession key={sentences.map((s) => s.id).join("-")} items={items} />;
}
