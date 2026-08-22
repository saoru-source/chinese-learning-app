import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/supabase/actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? (
        await supabase
          .from("users")
          .select("nickname")
          .eq("id", user.id)
          .maybeSingle()
      ).data
    : null;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">中国語学習アプリ</h1>

      <div className="flex gap-3 text-sm">
        <Link href="/words" className="rounded border border-line px-4 py-2">
          単語一覧
        </Link>
        <Link href="/sentences" className="rounded border border-line px-4 py-2">
          例文一覧
        </Link>
        <Link href="/quiz" className="rounded border border-line px-4 py-2">
          クイズ
        </Link>
        {user && (
          <Link href="/study" className="rounded border border-line px-4 py-2">
            段階的暗記
          </Link>
        )}
        <Link href="/groups" className="rounded border border-line px-4 py-2">
          グループ暗記
        </Link>
        {user && (
          <Link href="/writing" className="rounded border border-line px-4 py-2">
            ライティング
          </Link>
        )}
        {user && (
          <Link href="/listening" className="rounded border border-line px-4 py-2">
            ヒアリング
          </Link>
        )}
        <Link href="/patterns" className="rounded border border-line px-4 py-2">
          例文パターン集
        </Link>
        <Link href="/reading" className="rounded border border-line px-4 py-2">
          長文読解
        </Link>
        {user && (
          <Link href="/users" className="rounded border border-line px-4 py-2">
            みんなを探す
          </Link>
        )}
      </div>

      {user ? (
        <>
          <p className="text-sm text-ink-soft">
            ログイン中:{" "}
            <span className="font-medium">
              {profile?.nickname ?? user.email}
            </span>
          </p>
          {!profile?.nickname && (
            <p className="text-sm">
              <Link href="/profile" className="underline">
                ニックネームを設定する →
              </Link>
            </p>
          )}
          <form action={signOut}>
            <button type="submit" className="rounded border border-line px-4 py-2 text-sm">
              ログアウト
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="text-sm text-ink-soft">未ログインです</p>
          <div className="flex gap-3 text-sm">
            <Link href="/login" className="rounded bg-seal px-4 py-2 text-ink">
              ログイン
            </Link>
            <Link href="/signup" className="rounded border border-line px-4 py-2">
              新規登録
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
