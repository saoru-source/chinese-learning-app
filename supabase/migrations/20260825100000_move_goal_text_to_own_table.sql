-- RLS監査(2026-08-25)の結果、usersテーブルの"authenticated users can view
-- profiles"ポリシー(ログイン中なら誰でも全プロフィール閲覧可、フォロー機能
-- のためnickname等の非機微情報を想定して2026-08-23に設計)が、翌日以降に
-- 追加されたgoal_text(自由記述の目標メモ)にもそのまま適用されてしまい、
-- 他人の目標メモをAPI経由で読めてしまう状態だったため是正する。
--
-- goal_textだけを本人専用の新規テーブルに分離し、usersテーブルからは
-- 削除する(nickname等フォロー機能に必要なカラムはusersに残し、閲覧可能な
-- 設計のまま維持)。dark_mode(真偽値のみ、機微情報ではない)は対象外。

create table if not exists user_goals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  goal_text text,
  updated_at timestamptz not null default now()
);

alter table user_goals enable row level security;

drop policy if exists "users can view their own goal" on user_goals;
create policy "users can view their own goal"
  on user_goals for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert their own goal" on user_goals;
create policy "users can insert their own goal"
  on user_goals for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update their own goal" on user_goals;
create policy "users can update their own goal"
  on user_goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 既存データの移行(調査時点で1件のみ確認済み)
insert into user_goals (user_id, goal_text)
select id, goal_text from users where goal_text is not null
on conflict (user_id) do update set goal_text = excluded.goal_text;

alter table users drop column if exists goal_text;
