import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ShareRow = {
  id: string;
  sharer_id: string;
  recipient_id: string;
  item_type: "word" | "sentence" | "passage" | "pattern";
  item_id: number;
  created_at: string;
};

async function attachContent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: ShareRow[]
) {
  const sentenceIds = rows
    .filter((r) => r.item_type === "sentence")
    .map((r) => r.item_id);
  const passageIds = rows
    .filter((r) => r.item_type === "passage")
    .map((r) => r.item_id);

  const [{ data: sentences }, { data: passages }] = await Promise.all([
    sentenceIds.length
      ? supabase.from("sentences").select("id, hanzi").in("id", sentenceIds)
      : Promise.resolve({ data: [] as { id: number; hanzi: string }[] }),
    passageIds.length
      ? supabase.from("long_passages").select("id, title").in("id", passageIds)
      : Promise.resolve({ data: [] as { id: number; title: string }[] }),
  ]);

  const sentenceMap = new Map((sentences ?? []).map((s) => [s.id, s.hanzi]));
  const passageMap = new Map((passages ?? []).map((p) => [p.id, p.title]));

  return rows.map((r) => ({
    ...r,
    label:
      r.item_type === "sentence"
        ? (sentenceMap.get(r.item_id) ?? "(削除された例文)")
        : r.item_type === "passage"
          ? (passageMap.get(r.item_id) ?? "(削除された長文)")
          : "",
    href:
      r.item_type === "passage" ? `/reading/${r.item_id}` : "/sentences",
  }));
}

export default async function SharesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: receivedRaw } = await supabase
    .from("shares")
    .select("id, sharer_id, recipient_id, item_type, item_id, created_at")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false });

  const { data: sentRaw } = await supabase
    .from("shares")
    .select("id, sharer_id, recipient_id, item_type, item_id, created_at")
    .eq("sharer_id", user.id)
    .order("created_at", { ascending: false });

  const received = await attachContent(supabase, receivedRaw ?? []);
  const sent = await attachContent(supabase, sentRaw ?? []);

  const otherIds = Array.from(
    new Set([
      ...received.map((r) => r.sharer_id),
      ...sent.map((r) => r.recipient_id),
    ])
  );
  const { data: peopleRows } = otherIds.length
    ? await supabase.from("users").select("id, nickname").in("id", otherIds)
    : { data: [] as { id: string; nickname: string }[] };
  const nicknameOf = new Map(
    (peopleRows ?? []).map((p) => [p.id, p.nickname])
  );

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">共有</h1>
        <Link href="/" className="text-sm underline">
          トップに戻る
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-bold text-ink-soft">
          届いた共有({received.length})
        </h2>
        {received.length === 0 ? (
          <p className="text-sm text-ink-soft">まだ届いた共有はありません。</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {received.map((r) => (
              <li key={r.id} className="rounded border border-line p-3 text-sm">
                <p className="text-xs text-ink-soft">
                  {nicknameOf.get(r.sharer_id) ?? "不明なユーザー"}さんから
                </p>
                <Link href={r.href} className="underline">
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold text-ink-soft">
          送った共有({sent.length})
        </h2>
        {sent.length === 0 ? (
          <p className="text-sm text-ink-soft">まだ共有していません。</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sent.map((r) => (
              <li key={r.id} className="rounded border border-line p-3 text-sm">
                <p className="text-xs text-ink-soft">
                  {nicknameOf.get(r.recipient_id) ?? "不明なユーザー"}さんへ
                </p>
                <Link href={r.href} className="underline">
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
