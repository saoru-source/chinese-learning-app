-- ユーザーの公開プロフィールテーブル(CLAUDE.mdの基本テーブル方針に準拠)
-- auth.usersとは別に、ニックネーム等の公開情報だけを持つ。
-- 行の作成はアプリ側(ニックネーム設定画面)で行う(トリガーは使わない)。

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique,
  hsk_level integer,
  theme text,
  created_at timestamptz not null default now()
);

alter table users enable row level security;

-- ニックネーム検索・フォロー機能のため、ログイン済みユーザーは
-- お互いのプロフィールを閲覧できる(メールアドレス等は含まないため)
drop policy if exists "authenticated users can view profiles" on users;
create policy "authenticated users can view profiles"
  on users for select
  using (auth.role() = 'authenticated');

drop policy if exists "users can insert their own profile" on users;
create policy "users can insert their own profile"
  on users for insert
  with check (auth.uid() = id);

drop policy if exists "users can update their own profile" on users;
create policy "users can update their own profile"
  on users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
