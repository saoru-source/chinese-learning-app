-- 外部レビュー指摘「Claude API呼び出しに利用回数の上限が無く、費用面のリスクが
-- ある」への対応。ユーザーごとの1日あたりのAPI呼び出し回数を記録するテーブル。
-- AI出題(/quiz/ai)・作文添削・画像描写添削・長文要約添削の4機能すべてで
-- この1つのテーブル(1ユーザー1日1行)を共用し、呼び出し回数を合算でカウントする
-- (機能ごとに別カウントにはしない — 「1ユーザーあたりの利用回数上限」という
-- 依頼内容に対して最もシンプルで説明しやすい設計のため)。
--
-- usage_dateはUTC日付(src/lib/apiUsage/limit.tsでnew Date().toISOString()の
-- 日付部分を使用)。日付が変わればuser_id+usage_dateの組み合わせが変わり、
-- 自動的にカウントが0から再開する(明示的なリセット処理は不要)。

create table if not exists api_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  count integer not null default 0,
  primary key (user_id, usage_date)
);

alter table api_usage enable row level security;

drop policy if exists "users can view their own api usage" on api_usage;
create policy "users can view their own api usage"
  on api_usage for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert their own api usage" on api_usage;
create policy "users can insert their own api usage"
  on api_usage for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update their own api usage" on api_usage;
create policy "users can update their own api usage"
  on api_usage for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
