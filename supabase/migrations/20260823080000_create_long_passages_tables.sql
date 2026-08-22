-- 長文読解(追加コンテンツ仕様③)
-- HSK4/5/6級ごとに、そのレベルの単語・文法のみを使った長文(目安500字)を作成。
-- 長文1本につき設問5問(4択、実際のHSK読解問題と同様に問題文・選択肢とも中国語)。

create table if not exists long_passages (
  id integer primary key,
  hsk_level integer not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists passage_questions (
  id integer primary key,
  passage_id integer not null references long_passages(id),
  question_order integer not null,
  question_text text not null,
  choices jsonb not null,
  correct_choice_index integer not null,
  created_at timestamptz not null default now()
);

alter table long_passages enable row level security;
alter table passage_questions enable row level security;

drop policy if exists "long_passages are viewable by everyone" on long_passages;
create policy "long_passages are viewable by everyone"
  on long_passages for select
  using (true);

drop policy if exists "passage_questions are viewable by everyone" on passage_questions;
create policy "passage_questions are viewable by everyone"
  on passage_questions for select
  using (true);
