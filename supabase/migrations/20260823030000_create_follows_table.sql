-- フォロー関係テーブル(CLAUDE.mdの基本テーブル方針に準拠)

create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists follows_follower_id_idx on follows (follower_id);
create index if not exists follows_following_id_idx on follows (following_id);

alter table follows enable row level security;

-- 誰が誰をフォローしているかは、ログイン済みユーザーなら誰でも見られる
-- (フォロワー数の表示や、フォロー関係の確認に必要なため)
drop policy if exists "authenticated users can view follows" on follows;
create policy "authenticated users can view follows"
  on follows for select
  using (auth.role() = 'authenticated');

drop policy if exists "users can follow as themselves" on follows;
create policy "users can follow as themselves"
  on follows for insert
  with check (auth.uid() = follower_id);

drop policy if exists "users can unfollow their own follows" on follows;
create policy "users can unfollow their own follows"
  on follows for delete
  using (auth.uid() = follower_id);
