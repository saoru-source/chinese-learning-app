-- progressテーブルのitem_typeに'word_pronunciation'・'pattern_pronunciation'・
-- 'reading_question'を追加する。マイページの技能別スコア表示(話す・読む)のため。
--
-- 話す(発音チェック)は現状、会話練習(conversation_line)でのみ結果が記録されており、
-- 単語一覧・段階的暗記・グループ暗記(対象は単語)、例文パターン集(対象は
-- sentence_patterns)では記録自体が無かった。今回この4画面にも記録を追加するが、
-- 単語一覧・段階的暗記・グループ暗記の発音チェックは既存の'word'(間隔反復・
-- 苦手優先選択の対象)とは別の記録にする必要があるため、'word_pronunciation'を
-- 新設する('word'をそのまま使うと、発音チェックの正誤が間隔反復のreview_stageや
-- 苦手優先選択に混ざってしまい、既存ロジックを壊す)。同様の理由で例文パターン集は
-- 'pattern_pronunciation'(item_id=sentence_patterns.id、実データ200件)を新設する。
--
-- 読む(長文読解)は passage_questions.id(実データ450件)を item_id として
-- 'reading_question'を新設する。
--
-- id体系の重複について: word_pronunciation(item_id=words.id、1〜4680)・
-- pattern_pronunciation(item_id=sentence_patterns.id、1〜200)・
-- reading_question(item_id=passage_questions.id、1〜450)は、いずれも他の
-- item_typeのid範囲と数値としては重なり得るが、progressの一意制約は
-- (user_id, item_type, item_id)の組み合わせのため、item_typeを分けている限り
-- 既存レコードと衝突・上書きし合うことはない(conversation_line/listening_question
-- 追加時と同じ考え方)。
--
-- 既存の'word'/'sentence'/'grammar'/'conversation_line'/'listening_question'の
-- 値・データはそのまま維持する。
alter table progress drop constraint if exists progress_item_type_check;
alter table progress add constraint progress_item_type_check
  check (item_type in (
    'word',
    'sentence',
    'grammar',
    'conversation_line',
    'listening_question',
    'word_pronunciation',
    'pattern_pronunciation',
    'reading_question'
  ));
