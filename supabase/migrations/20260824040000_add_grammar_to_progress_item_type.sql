-- progressテーブルのitem_typeに'grammar'を追加する。
-- 文法ドリル(/quiz/aiの文法モード)で、単語(word)と同様に苦手優先の
-- 個人化出題ができるようにするため(item_idはgrammar_points.idを参照)。
-- 既存の'word'/'sentence'の値・データはそのまま維持する。
alter table progress drop constraint if exists progress_item_type_check;
alter table progress add constraint progress_item_type_check
  check (item_type in ('word', 'sentence', 'grammar'));
