-- ダークモード(ライト/ダーク)の状態を永続化するためのカラム。
-- テーマ(theme)・HSKレベル(hsk_level)・目標(goal_text)と同じ方針:
-- ログイン中のみ保存し、未ログイン(ゲスト)時はローカルstateのみで完結する。
alter table users add column if not exists dark_mode boolean not null default false;
