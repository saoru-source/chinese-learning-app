-- ヒアリング機能(追加コンテンツ仕様⑥)
--
-- 音声はCLAUDE.md記載のaudio_variants(有料TTS)を使わず、ブラウザ標準の
-- Web Speech API(SpeechSynthesis)でtext_zhを都度読み上げる方式に変更した
-- (2026-08-23、有料TTS未契約のための暫定対応。CLAUDE.md本体にも追記)。
-- そのためaudio_source(word_id/sentence_id参照)は使わず、読み上げに
-- 必要なテキストをtext_zh列にそのまま持たせる自己完結型のテーブルにする。

create table if not exists listening_questions (
  id integer primary key,
  hsk_level integer not null,
  mode text not null check (mode in ('choice', 'dictation')),
  text_zh text not null,
  correct_answer text not null,
  choices jsonb,
  created_at timestamptz not null default now()
);

alter table listening_questions enable row level security;

drop policy if exists "listening_questions are viewable by everyone" on listening_questions;
create policy "listening_questions are viewable by everyone"
  on listening_questions for select
  using (true);
