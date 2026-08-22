import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { upsertNickname } from "@/lib/profile/actions";
import ThemeSwitcher from "./ThemeSwitcher";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("nickname, theme")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">プロフィール</h1>
        <Link href="/" className="text-sm underline">
          トップに戻る
        </Link>
      </div>

      {params.message && (
        <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">
          {params.message}
        </p>
      )}
      {params.error && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {params.error}
        </p>
      )}

      <p className="mb-4 text-sm text-ink-soft">
        {profile?.nickname
          ? `現在のニックネーム: ${profile.nickname}`
          : "ニックネームがまだ設定されていません。フォロー機能で他のユーザーに検索されるための名前です。"}
      </p>

      <form action={upsertNickname} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          ニックネーム
          <input
            type="text"
            name="nickname"
            defaultValue={profile?.nickname ?? ""}
            required
            maxLength={20}
            className="rounded border border-line px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded bg-seal py-2 text-sm text-ink">
          保存する
        </button>
      </form>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-bold text-ink-soft">配色テーマ</h2>
        <ThemeSwitcher current={profile?.theme ?? "yebe"} />
      </div>
    </div>
  );
}
