-- 単語系画面(単語一覧・段階的暗記・グループ暗記・AI出題・TappableText・
-- WordDetailCard)に品詞バッジを表示するため、wordsテーブルに品詞カラムを追加する。
-- 値はword_groupsテーブルのgroup_type='pos'のcategory列と同じ11分類の
-- 日本語ラベル(名詞/動詞/形容詞/代詞/数詞/量詞/介詞/副詞/助詞/接続詞/感嘆詞)を
-- そのまま使う(既存の分類体系と整合させるため)。未分類の単語はNULLのままとし、
-- 画面側はNULLのときバッジ自体を表示しない。

alter table words add column if not exists word_type text;
