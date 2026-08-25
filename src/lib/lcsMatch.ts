// 姉妹アプリ「HSK会話トレーニング」(claude/HSKconversations.html, HSKspeaking_practice)と
// 同一のアルゴリズム。句読点等を除去した上でLCS(最長共通部分列)によりお手本テキストと
// 対象テキスト(音声認識結果/入力テキスト等)を文字単位で照合し、一致度を算出する。
// PronunciationCheck(発音チェック)とDictationCard(ディクテーション採点)で共用する。
const PUNCT_RE = /[，。！？：；、（）“”"'—…,.!?:;()\s]/g;

export function stripForCompare(s: string): string {
  return s.replace(PUNCT_RE, "");
}

export function lcsMatch(target: string, said: string): { score: number; matched: boolean[] } {
  const m = target.length;
  const n = said.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (target[i - 1] === said[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const matched = new Array(m).fill(false);
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (target[i - 1] === said[j - 1]) {
      matched[i - 1] = true;
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return { score: dp[m][n], matched };
}
