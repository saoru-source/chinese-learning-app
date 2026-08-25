-- HSKレベルの「卒業試験」(フェーズ③)の受験結果を記録するテーブル。
-- 節目テスト(milestone_attempts)と違い、対象レベル全体(単語+文法)から
-- 出題する1本のテスト(前半/後半の区別なし)のため、half列は持たない。
-- 節目テストと同じく再挑戦のたびに新規行を追加する方式にし、
-- 「一度でも合格したか」は passed=true の行が存在するかで判定する。

create table if not exists graduation_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hsk_level integer not null check (hsk_level between 1 and 6),
  score integer not null,
  total_questions integer not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists graduation_attempts_user_id_idx on graduation_attempts (user_id);

alter table graduation_attempts enable row level security;

drop policy if exists "users can view their own graduation attempts" on graduation_attempts;
create policy "users can view their own graduation attempts"
  on graduation_attempts for select
  using (auth.uid() = user_id);

drop policy if exists "users can insert their own graduation attempts" on graduation_attempts;
create policy "users can insert their own graduation attempts"
  on graduation_attempts for insert
  with check (auth.uid() = user_id);
