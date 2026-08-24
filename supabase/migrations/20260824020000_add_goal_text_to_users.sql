-- ホーム画面の目標カード(GoalCard)の入力内容を永続化するためのカラム。
-- テーマ(theme)・HSKレベル(hsk_level)と同じ方針:
-- ログイン中のみ保存し、未ログイン(ゲスト)時はローカルstateのみで完結する。
alter table users add column if not exists goal_text text;
