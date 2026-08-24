import { updatePassword } from "@/lib/supabase/actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-[28.8px] font-bold">新しいパスワードの設定</h1>

      {params.error && (
        <p className="rounded bg-red-50 p-3 text-[16.8px] text-red-700">
          {params.error}
        </p>
      )}

      <form action={updatePassword} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-[16.8px]">
          新しいパスワード
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="rounded border border-line px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded bg-seal py-2 text-ink">
          パスワードを更新する
        </button>
      </form>
    </div>
  );
}
