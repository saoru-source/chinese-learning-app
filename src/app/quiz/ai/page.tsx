import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AiQuizCard from "./AiQuizCard";

export default async function AiQuizPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI出題</h1>
        <Link href="/" className="text-sm underline">
          トップに戻る
        </Link>
      </div>
      <p className="mb-6 text-sm text-ink-soft">
        出題範囲を選ぶと、あなたの苦手な単語や文法パターンを使って、AIがその場で新しい問題を作ります。
      </p>

      <AiQuizCard />
    </div>
  );
}
