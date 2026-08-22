-- ライティング機能(追加コンテンツ仕様⑦)のうち、今すぐ作れる部分:
-- 語順並べ替え・自由記述のお題・提出物(AI添削結果込み)

create table if not exists writing_scramble_questions (
  id integer primary key,
  hsk_level integer not null,
  words_shuffled jsonb not null,
  correct_sentence text not null,
  meaning_ja text,
  created_at timestamptz not null default now()
);

create table if not exists writing_topics (
  id integer primary key,
  hsk_level integer not null,
  category text not null check (category in ('free_topic', 'scenario')),
  prompt_text text not null,
  meaning_ja text,
  created_at timestamptz not null default now()
);

-- item_type: topic(お題への自由記述) / image(画像描写、将来対応) /
-- passage_summary(長文要約、③長文読解が揃ってから対応)
create table if not exists writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('topic', 'image', 'passage_summary')),
  item_id integer,
  submitted_text text not null,
  ai_feedback text,
  created_at timestamptz not null default now()
);

create index if not exists writing_submissions_user_id_idx on writing_submissions (user_id);

alter table writing_scramble_questions enable row level security;
alter table writing_topics enable row level security;
alter table writing_submissions enable row level security;

drop policy if exists "writing_scramble_questions are viewable by everyone" on writing_scramble_questions;
create policy "writing_scramble_questions are viewable by everyone"
  on writing_scramble_questions for select
  using (true);

drop policy if exists "writing_topics are viewable by everyone" on writing_topics;
create policy "writing_topics are viewable by everyone"
  on writing_topics for select
  using (true);

drop policy if exists "users can view their own writing submissions" on writing_submissions;
create policy "users can view their own writing submissions"
  on writing_submissions for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert their own writing submissions" on writing_submissions;
create policy "users can insert their own writing submissions"
  on writing_submissions for insert
  with check (auth.uid() = user_id);
