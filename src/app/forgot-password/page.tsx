import Link from "next/link";
import { requestPasswordReset } from "@/lib/supabase/actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-[28.8px] font-bold">パスワードの再設定</h1>
      <p className="text-[16.8px] text-ink-soft">
        登録済みのメールアドレスを入力してください。再設定用のリンクをお送りします。
      </p>

      {params.message && (
        <p className="rounded bg-green-50 p-3 text-[16.8px] text-green-700">
          {params.message}
        </p>
      )}
      {params.error && (
        <p className="rounded bg-red-50 p-3 text-[16.8px] text-red-700">
          {params.error}
        </p>
      )}

      <form action={requestPasswordReset} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-[16.8px]">
          メールアドレス
          <input
            type="email"
            name="email"
            required
            className="rounded border border-line px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded bg-seal py-2 text-ink">
          再設定メールを送る
        </button>
      </form>

      <div className="text-[16.8px]">
        <Link href="/login" className="text-ink-soft">ログイン画面に戻る</Link>
      </div>
    </div>
  );
}
