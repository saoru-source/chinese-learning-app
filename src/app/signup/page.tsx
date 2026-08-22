import Link from "next/link";
import { signUp, signInWithGoogle } from "@/lib/supabase/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-bold">新規登録</h1>

      {params.message && (
        <p className="rounded bg-green-50 p-3 text-sm text-green-700">
          {params.message}
        </p>
      )}
      {params.error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">
          {params.error}
        </p>
      )}

      <form action={signUp} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          メールアドレス
          <input
            type="email"
            name="email"
            required
            className="rounded border border-line px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          パスワード
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="rounded border border-line px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded bg-seal py-2 text-ink">
          登録する
        </button>
      </form>

      <div className="flex items-center gap-2 text-xs text-ink-soft">
        <span className="h-px flex-1 bg-line" />
        または
        <span className="h-px flex-1 bg-line" />
      </div>

      <form action={signInWithGoogle}>
        <button type="submit" className="w-full rounded border border-line py-2">
          Googleで登録
        </button>
      </form>

      <div className="text-sm">
        <Link href="/login">すでにアカウントをお持ちの方はこちら</Link>
      </div>
    </div>
  );
}
