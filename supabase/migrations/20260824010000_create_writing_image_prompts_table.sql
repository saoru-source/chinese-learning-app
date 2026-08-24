-- ライティング「画像描写」機能(追加コンテンツ仕様⑦-3)のテーブル。
-- 画像素材は未準備のため、is_published = true の行のみ出題対象とする
-- (データ投入はSupabase管理画面から直接INSERTする想定)。

create table if not exists writing_image_prompts (
  id integer primary key,
  image_url text not null,
  hsk_level integer not null,
  topic text,
  reference_keywords text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table writing_image_prompts enable row level security;

drop policy if exists "published writing_image_prompts are viewable by everyone" on writing_image_prompts;
create policy "published writing_image_prompts are viewable by everyone"
  on writing_image_prompts for select
  using (is_published = true);
