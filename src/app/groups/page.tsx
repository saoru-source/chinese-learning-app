import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function GroupsPage() {
  const supabase = await createClient();
  const { data: groups } = await supabase
    .from("word_groups")
    .select("id, group_type, category, title")
    .order("id", { ascending: true });

  const themeGroups = (groups ?? []).filter((g) => g.group_type === "theme");
  const posGroups = (groups ?? []).filter((g) => g.group_type === "pos");

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">グループ暗記</h1>
        <Link href="/" className="text-sm underline">
          トップに戻る
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold text-ink-soft">テーマ別</h2>
        <div className="grid grid-cols-2 gap-3">
          {themeGroups.map((g) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="rounded border border-line p-4 text-center text-sm"
            >
              {g.category}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-ink-soft">品詞別</h2>
        <div className="grid grid-cols-2 gap-3">
          {posGroups.map((g) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="rounded border border-line p-4 text-center text-sm"
            >
              {g.category}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
