export function speak(text: string, options?: { rate?: number; pitch?: number; voiceName?: string }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  if (options?.rate) utterance.rate = options.rate;
  if (options?.pitch) utterance.pitch = options.pitch;
  if (options?.voiceName) {
    const voice = window.speechSynthesis.getVoices().find((v) => v.name === options.voiceName);
    if (voice) utterance.voice = voice;
  }
  window.speechSynthesis.speak(utterance);
}

// ブラウザによってはgetVoices()が非同期に(onvoiceschangedの後で)しか
// 埋まらないため、少し待ってから中国語ボイス一覧を取得する。
function getChineseVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve([]);
      return;
    }
    // 標準中国語(zh-CN)を優先する。zh-CNが2種類未満しか無い環境では、
    // 台湾/香港のボイスも含めて聞き分けやすさを優先する。
    const pick = () => {
      const all = window.speechSynthesis.getVoices();
      const mainland = all.filter((v) => v.lang.toLowerCase() === "zh-cn");
      if (mainland.length >= 2) return mainland;
      return all.filter((v) => v.lang.toLowerCase().startsWith("zh"));
    };
    const existing = pick();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => resolve(pick());
    setTimeout(() => resolve(pick()), 1000);
  });
}

export type SpeakerVoiceOptions = { pitch?: number; voiceName?: string };

// pitchの話者別パレット。1.0(標準)を基準に、2人目はやや高め、
// 3人目はやや低めにして聞き分けやすくする(会話は最大3人まで確認済み)。
const PITCH_PALETTE = [1, 1.35, 0.75];

// 話者名の配列(会話の登場人物順)を受け取り、話者ごとに異なる声の設定を作る。
// 中国語ボイスが2種類以上使える環境では話者ごとに別ボイスを割り当て、
// 1種類しか無い/取得できない環境ではpitch(声の高さ)を話者ごとに変えて代替する。
export async function pickSpeakerVoices(speakerNames: string[]): Promise<Record<string, SpeakerVoiceOptions>> {
  const voices = await getChineseVoicesAsync();
  const result: Record<string, SpeakerVoiceOptions> = {};
  speakerNames.forEach((name, i) => {
    if (voices.length >= 2) {
      result[name] = { voiceName: voices[i % voices.length].name };
    } else {
      result[name] = { pitch: PITCH_PALETTE[i % PITCH_PALETTE.length] };
    }
  });
  return result;
}
