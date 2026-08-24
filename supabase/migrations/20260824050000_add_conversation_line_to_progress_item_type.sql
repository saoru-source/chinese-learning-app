-- progressテーブルのitem_typeに'conversation_line'を追加する。
-- 会話練習(/conversations/[id])の各セリフの発音チェック結果を記録するため。
-- 'sentence'を流用しない理由: sentences.id(1〜1947)とconversation_lines.id(1〜656)は
-- 別テーブルの独立したinteger主キーで、IDレンジが重複している
-- (CSV一括インポート時にJSON側で採番したもので、テーブルを跨いだ一意性の
-- 保証が無い)。'sentence'として記録すると、たまたま同じidを持つ
-- 例文と会話セリフのprogressレコードが衝突・上書きし合う恐れがあるため、
-- 独立したitem_typeを新設する。
-- 既存の'word'/'sentence'/'grammar'の値・データはそのまま維持する。
alter table progress drop constraint if exists progress_item_type_check;
alter table progress add constraint progress_item_type_check
  check (item_type in ('word', 'sentence', 'grammar', 'conversation_line'));
