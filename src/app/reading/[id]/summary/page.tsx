import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SummaryForm from "./SummaryForm";

export default async function PassageSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: passage } = await supabase
    .from("long_passages")
    .select("id, hsk_level, title, body")
    .eq("id", id)
    .maybeSingle();

  if (!passage) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">長文要約</h1>
        <Link href={`/reading/${passage.id}`} className="text-sm underline">
          本文に戻る
        </Link>
      </div>

      <div className="mb-6 rounded border border-line p-4">
        <p className="mb-1 text-xs text-ink-soft">HSK{passage.hsk_level}級</p>
        <p className="mb-2 text-sm font-bold">{passage.title}</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
          {passage.body}
        </p>
      </div>

      <p className="mb-4 text-sm text-ink-soft">
        上の文章を、自分の言葉で中国語のまま要約してください。
      </p>

      <SummaryForm passageId={passage.id} />
    </div>
  );
}
