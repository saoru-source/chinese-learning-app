import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import { LevelProvider } from "@/lib/level/LevelContext";
import { ModeProvider } from "@/lib/mode/ModeContext";
import AppShell from "@/components/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "中文一途 | 中国語学習アプリ",
  description:
    "HSK1〜6級対応の中国語学習アプリ。単語・文法・発音・会話・作文をAIと一緒に練習できます。",
  other: {
    google: "notranslate",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let theme: string | null = null;
  let level: number | null = null;
  let mode: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("theme, hsk_level, dark_mode")
      .eq("id", user.id)
      .maybeSingle();
    theme = profile?.theme ?? null;
    level = profile?.hsk_level ?? null;
    mode = profile?.dark_mode ? "dark" : null;
  }

  return (
    <html
      lang="ja"
      data-theme={theme ?? undefined}
      data-mode={mode ?? undefined}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider initialTheme={theme}>
          <LevelProvider initialLevel={level}>
            <ModeProvider initialMode={mode}>
              <AppShell>{children}</AppShell>
            </ModeProvider>
          </LevelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
