import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { followUser, unfollowUser } from "@/lib/follows/actions";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: myProfile } = await supabase
    .from("users")
    .select("nickname")
    .eq("id", user.id)
    .maybeSingle();

  const { data: followingRows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);
  const followingIds = new Set(
    (followingRows ?? []).map((r) => r.following_id)
  );

  const { data: followerIdRows } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", user.id);
  const followerIds = (followerIdRows ?? []).map((r) => r.follower_id);
  const followerRows = followerIds.length
    ? (
        await supabase
          .from("users")
          .select("id, nickname")
          .in("id", followerIds)
      ).data
    : [];

  let searchResults: { id: string; nickname: string }[] = [];
  if (q) {
    const { data } = await supabase
      .from("users")
      .select("id, nickname")
      .ilike("nickname", `%${q}%`)
      .neq("id", user.id)
      .limit(20);
    searchResults = data ?? [];
  }

  const followingList = followingIds.size
    ? (
        await supabase
          .from("users")
          .select("id, nickname")
          .in("id", Array.from(followingIds))
      ).data ?? []
    : [];

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[28.8px] font-bold">みんなを探す</h1>
        <Link href="/" className="text-[16.8px] underline">
          トップに戻る
        </Link>
      </div>

      {!myProfile?.nickname && (
        <p className="mb-4 rounded bg-yellow-50 p-3 text-[16.8px] text-yellow-800">
          あなたのニックネームが未設定です。
          <Link href="/profile" className="underline">
            設定する
          </Link>
          と、他のユーザーから見つけてもらいやすくなります。
        </p>
      )}

      <form className="mb-6 flex gap-2" action="/users">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="ニックネームで検索"
          className="flex-1 rounded border border-line px-3 py-2 text-[16.8px]"
        />
        <button type="submit" className="rounded bg-seal px-4 py-2 text-[16.8px] text-ink">
          検索
        </button>
      </form>

      {q && (
        <div className="mb-8">
          <h2 className="mb-2 text-[16.8px] font-bold text-ink-soft">
            「{q}」の検索結果
          </h2>
          {searchResults.length === 0 ? (
            <p className="text-[16.8px] text-ink-soft">見つかりませんでした。</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {searchResults.map((u) => {
                const isFollowing = followingIds.has(u.id);
                return (
                  <li
                    key={u.id}
                    className="flex items-center justify-between rounded border border-line px-3 py-2 text-[16.8px]"
                  >
                    <span>{u.nickname}</span>
                    <form action={isFollowing ? unfollowUser : followUser}>
                      <input type="hidden" name="targetId" value={u.id} />
                      <button
                        type="submit"
                        className={`rounded border px-3 py-1 text-[14.4px] ${
                          isFollowing
                            ? "border-line"
                            : "border-seal bg-seal text-ink"
                        }`}
                      >
                        {isFollowing ? "フォロー中" : "フォローする"}
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <div className="mb-8">
        <h2 className="mb-2 text-[16.8px] font-bold text-ink-soft">
          フォロー中({followingList.length})
        </h2>
        {followingList.length === 0 ? (
          <p className="text-[16.8px] text-ink-soft">まだ誰もフォローしていません。</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {followingList.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded border border-line px-3 py-2 text-[16.8px]"
              >
                <span>{u.nickname}</span>
                <form action={unfollowUser}>
                  <input type="hidden" name="targetId" value={u.id} />
                  <button type="submit" className="rounded border border-line px-3 py-1 text-[14.4px]">
                    フォロー解除
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-[16.8px] font-bold text-ink-soft">
          フォロワー({followerRows?.length ?? 0})
        </h2>
        {!followerRows || followerRows.length === 0 ? (
          <p className="text-[16.8px] text-ink-soft">まだフォロワーがいません。</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {followerRows.map((u) => (
              <li key={u.id} className="rounded border border-line px-3 py-2 text-[16.8px]">
                {u.nickname}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
