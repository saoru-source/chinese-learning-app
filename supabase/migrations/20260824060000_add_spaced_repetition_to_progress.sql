-- 単語学習(item_type='word')向けの間隔反復(spaced repetition)管理カラムを追加する。
-- review_stage: 現在の習熟段階(0=未着手/最初の状態、5=マスター済み)。
-- next_review_at: 次にいつ復習すべきかの日時。nullは「まだ復習スケジュールに
-- 乗っていない」ことを表す(例: /wordsで見ただけでまだ一度もクイズに答えて
-- いない単語)。
--
-- 既存データの移行方針: 真っさらな状態から開始する。既存のcorrect_count等の
-- 履歴から段階を推定するような複雑な移行は行わず、review_stageは全行
-- デフォルト値の0、next_review_atは全行nullのまま追加する(=既存の全単語が
-- 「未着手」として間隔反復を開始する)。これにより、この移行直後は
-- マイページの「習得単語数」が一時的に0付近まで下がる点はご了承ください。
--
-- item_type='word'以外の行(grammar/sentence/conversation_line)はこのカラムを
-- 使わない(今回のフェーズでは単語のみが対象のため)。
alter table progress add column if not exists review_stage integer not null default 0;
alter table progress add column if not exists next_review_at timestamptz;
