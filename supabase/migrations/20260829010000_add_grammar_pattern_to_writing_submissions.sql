-- 「書く」の新モード「文法の型を使った例文添削」(/writing/grammar)用。
-- 既存のwriting_submissions.item_typeのCHECK制約(topic/image/passage_summary)に
-- grammar_pattern(item_id=grammar_points.id)を追加する。

alter table writing_submissions drop constraint if exists writing_submissions_item_type_check;
alter table writing_submissions add constraint writing_submissions_item_type_check
  check (item_type in ('topic', 'image', 'passage_summary', 'grammar_pattern'));
