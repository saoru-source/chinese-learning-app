-- 共有機能(SNS機能の一部、誰が誰に何を共有したか)
-- item_typeはprogressテーブルと同じ方針(word/sentence/passage/pattern等)。
-- 初期実装では例文(sentence)と長文読解(passage)の2種類のみUIを用意する。

create table if not exists shares (
  id uuid primary key default gen_random_uuid(),
  sharer_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('word', 'sentence', 'passage', 'pattern')),
  item_id integer not null,
  message text,
  created_at timestamptz not null default now(),
  check (sharer_id <> recipient_id)
);

create index if not exists shares_sharer_id_idx on shares (sharer_id);
create index if not exists shares_recipient_id_idx on shares (recipient_id);

alter table shares enable row level security;

-- 共有した側・された側の両方が、その共有を閲覧できる
drop policy if exists "users can view shares they sent or received" on shares;
create policy "users can view shares they sent or received"
  on shares for select
  using (auth.uid() = sharer_id or auth.uid() = recipient_id);

drop policy if exists "users can share as themselves" on shares;
create policy "users can share as themselves"
  on shares for insert
  with check (auth.uid() = sharer_id);
