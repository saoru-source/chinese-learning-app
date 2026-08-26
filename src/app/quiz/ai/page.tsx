import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AiQuizCard from "./AiQuizCard";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="var(--ink-soft)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

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
      <div className="mb-2 flex items-center gap-2.5">
        <Link href="/" aria-label="トップに戻る" className="flex items-center">
          <BackArrowIcon />
        </Link>
        <h1 className="text-[28.8px] font-bold">AI出題</h1>
      </div>
      <p className="mb-6 text-[16.8px] text-ink-soft">
        出題範囲を選ぶと、あなたの苦手な単語や文法パターンを使って、AIがその場で新しい問題を作ります。
      </p>

      <AiQuizCard />
    </div>
  );
}
