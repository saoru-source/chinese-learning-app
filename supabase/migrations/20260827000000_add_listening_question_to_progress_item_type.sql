-- progressテーブルのitem_typeに'listening_question'を追加する。
-- ヒアリング(選択式/listening/choice・ディクテーション/listening/dictation)の
-- 正誤結果を記録するため。
--
-- 'word'/'sentence'を流用しない理由: listening_questionsのtext_zhは実データで
-- 120問中119件がwords.hanziと完全一致するが(src/lib/listening/wordDetail.ts参照)、
-- 100%ではなく該当語が見つからないケースが存在する。また、conversation_line
-- 実装時と同じ観点でid体系を確認したところ、listening_questions.idは1〜120の
-- 独立したinteger主キーで、words.id(1〜4680)・sentences.id(1〜5847超)の
-- 前半部分と丸ごと重複している。'word'または'sentence'としてそのまま記録すると、
-- 既存の単語・例文のprogressレコードと衝突・上書きし合う恐れがあるため、
-- 独立したitem_typeを新設する。
--
-- 選択式(正誤の二択)とディクテーション(LCS一致率60%以上で合格)は採点方式が
-- 異なるが、listening_questions.idはchoice/dictationの両モードを通じて
-- 一意(同じidが両モードに重複することはない)なので、記録先のitem_typeは
-- 1つにまとめる(item_idからlistening_questions.modeを参照すれば、
-- 必要であれば後からモード別の集計もできる)。
--
-- 既存の'word'/'sentence'/'grammar'/'conversation_line'の値・データはそのまま維持する。
alter table progress drop constraint if exists progress_item_type_check;
alter table progress add constraint progress_item_type_check
  check (item_type in ('word', 'sentence', 'grammar', 'conversation_line', 'listening_question'));
