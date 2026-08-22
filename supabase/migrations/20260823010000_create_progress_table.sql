-- 学習履歴(progress)テーブル
-- item_type + item_id の組み合わせで、単語・例文などあらゆる学習対象を
-- 1テーブルで管理する(CLAUDE.mdのデータ設計方針に準拠)。
-- 現時点ではitem_type = 'word' のみ使用(クイズ機能がwordsのみ対応のため)。
-- 将来sentences等にも対応する際は item_type = 'sentence' 等を追加する想定。

create table if not exists progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('word', 'sentence')),
  item_id integer not null,
  correct_count integer not null default 0,
  incorrect_count integer not null default 0,
  last_studied_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create index if not exists progress_user_id_idx on progress (user_id);

-- RLS: 自分の学習履歴だけを読み書きできる
alter table progress enable row level security;

drop policy if exists "users can view their own progress" on progress;
create policy "users can view their own progress"
  on progress for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert their own progress" on progress;
create policy "users can insert their own progress"
  on progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can update their own progress" on progress;
create policy "users can update their own progress"
  on progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
