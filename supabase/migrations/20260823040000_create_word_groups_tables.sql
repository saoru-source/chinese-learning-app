-- グループ暗記モード(追加コンテンツ仕様①)
-- テーマ別(対義語・数字・色 等)/品詞別(名詞・動詞 等)の2軸で
-- 単語をセット化する。同じ単語が両方の軸に重複して登場してよい設計。

create table if not exists word_groups (
  id integer primary key,
  group_type text not null check (group_type in ('theme', 'pos')),
  category text not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists word_group_items (
  id integer primary key,
  group_id integer not null references word_groups(id) on delete cascade,
  word_id integer not null references words(id),
  role text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists word_group_items_group_id_idx on word_group_items (group_id);

alter table word_groups enable row level security;
alter table word_group_items enable row level security;

drop policy if exists "word_groups are viewable by everyone" on word_groups;
create policy "word_groups are viewable by everyone"
  on word_groups for select
  using (true);

drop policy if exists "word_group_items are viewable by everyone" on word_group_items;
create policy "word_group_items are viewable by everyone"
  on word_group_items for select
  using (true);
