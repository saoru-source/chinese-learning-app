-- 単語の「節目ごとの合格テスト」(フェーズ②)の受験結果を記録するテーブル。
-- 節目はHSK1〜6各レベルを前半(first)/後半(second)に機械的に2分割した
-- 12個(単語プールの算出はsrc/lib/milestones/select.tsで行い、
-- このテーブルには結果のみを保存する)。
-- 既存のprogressテーブル(item_type='word'/'sentence'/'grammar'/
-- 'conversation_line'、単語・文単位の記録)では節目単位のテスト結果を
-- 表現できないため新規テーブルとした。
-- 再挑戦のたびに新規行を追加する方式(最新結果で上書きしない)にし、
-- 「一度でも合格したか」は passed=true の行が存在するかで判定する。

create table if not exists milestone_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hsk_level integer not null check (hsk_level between 1 and 6),
  half text not null check (half in ('first', 'second')),
  score integer not null,
  total_questions integer not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists milestone_attempts_user_id_idx on milestone_attempts (user_id);

alter table milestone_attempts enable row level security;

drop policy if exists "users can view their own milestone attempts" on milestone_attempts;
create policy "users can view their own milestone attempts"
  on milestone_attempts for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert their own milestone attempts" on milestone_attempts;
create policy "users can insert their own milestone attempts"
  on milestone_attempts for insert
  with check (auth.uid() = user_id);
