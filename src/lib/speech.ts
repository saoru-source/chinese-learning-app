export function speak(text: string, options?: { rate?: number }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  if (options?.rate) utterance.rate = options.rate;
  window.speechSynthesis.speak(utterance);
}
