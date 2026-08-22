import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ReadingPage() {
  const supabase = await createClient();
  const { data: passages } = await supabase
    .from("long_passages")
    .select("id, hsk_level, title")
    .order("id", { ascending: true });

  const levels = [4, 5, 6];

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">長文読解</h1>
        <Link href="/" className="text-sm underline">
          トップに戻る
        </Link>
      </div>

      {levels.map((level) => {
        const levelPassages = (passages ?? []).filter(
          (p) => p.hsk_level === level
        );
        if (levelPassages.length === 0) return null;
        return (
          <section key={level} className="mb-8">
            <h2 className="mb-3 text-sm font-bold text-ink-soft">
              HSK{level}級
            </h2>
            <ul className="flex flex-col gap-2">
              {levelPassages.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/reading/${p.id}`}
                    className="block rounded border border-line p-3 text-sm"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
