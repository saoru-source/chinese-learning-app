-- 例文パターン集(追加コンテンツ仕様④)
-- 口語(日常)100パターン・ビジネス(硬文)100パターンを想定。
-- situationはCLAUDE.mdで確定済みの6シチュエーション×2スタイル
-- (口語: 友達との約束/買い物・値段交渉/体調不良・病院/レストラン・注文/
--  道を尋ねる/SNS・チャット表現、ビジネス: メールの書き出し・結び/
--  会議での発言/依頼・お願い/謝罪・お詫び/自己紹介・名刺交換/電話応対)

create table if not exists sentence_patterns (
  id integer primary key,
  style text not null check (style in ('colloquial', 'business')),
  situation text not null,
  hsk_level integer not null,
  hanzi text not null,
  pinyin text,
  meaning_ja text,
  created_at timestamptz not null default now()
);

alter table sentence_patterns enable row level security;

drop policy if exists "sentence_patterns are viewable by everyone" on sentence_patterns;
create policy "sentence_patterns are viewable by everyone"
  on sentence_patterns for select
  using (true);
