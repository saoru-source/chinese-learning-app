import Link from "next/link";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="var(--ink-soft)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h2 style={{ fontSize: 16.8, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>{title}</h2>
      <div style={{ fontSize: 14.4, color: "var(--ink-soft)", lineHeight: 1.8 }}>{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/profile" aria-label="マイページに戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 19.2, fontWeight: 700, color: "var(--ink)" }}>プライバシーポリシー</h1>
      </div>

      <div
        style={{
          marginBottom: 20,
          fontSize: 13.2,
          fontWeight: 700,
          color: "var(--miss-red)",
          background: "color-mix(in srgb, var(--miss-red) 10%, transparent)",
          border: "1px solid var(--miss-red)",
          borderRadius: 12,
          padding: "10px 14px",
        }}
      >
        ※運営者名・連絡先等の記載内容は仮のものです。正式な内容に更新され次第、この注記は削除します。
      </div>

      <p style={{ fontSize: 14.4, color: "var(--ink-soft)", lineHeight: 1.8, marginBottom: 22 }}>
        SOLSORAL（以下「運営者」といいます）は、本アプリ「中文一途（仮）」（以下「本サービス」といいます）における利用者の個人情報の取り扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
      </p>

      <Section title="1. 取得する情報">
        <p style={{ marginBottom: 8 }}>本サービスは、利用登録・ご利用にあたり、以下の情報を取得します。</p>
        <ul style={{ paddingLeft: 20, listStyle: "disc", display: "flex", flexDirection: "column", gap: 6 }}>
          <li>メールアドレス（会員登録・ログイン認証のため）</li>
          <li>Googleアカウントでログインする場合は、Googleアカウントに登録された氏名・メールアドレス等の情報</li>
          <li>ニックネーム、目標として入力されたテキスト</li>
          <li>学習の記録（単語・文法・リスニング等の正誤履歴、テスト結果等）</li>
          <li>自由作文・画像描写・要約等としてご自身が入力されたテキスト</li>
          <li>発音チェック機能利用時の音声データ（ブラウザ内で解析され、運営者のサーバーには保存されません）</li>
        </ul>
      </Section>

      <Section title="2. 利用目的">
        <p style={{ marginBottom: 8 }}>取得した情報は、以下の目的で利用します。</p>
        <ol style={{ paddingLeft: 20, listStyle: "decimal", display: "flex", flexDirection: "column", gap: 6 }}>
          <li>本サービスの提供・維持・改善のため</li>
          <li>ログイン認証、複数端末での学習記録の同期のため</li>
          <li>入力いただいた作文等について、AI（Anthropic社のClaude API）による添削・フィードバックを生成するため</li>
          <li>フォロー機能・共有機能など、利用者間の機能を提供するため</li>
          <li>お問い合わせへの対応のため</li>
        </ol>
      </Section>

      <Section title="3. 第三者提供・委託">
        <p style={{ marginBottom: 8 }}>
          運営者は、以下の外部サービスに情報の取り扱いを委託しています。委託先においても適切な情報管理が行われるよう努めます。
        </p>
        <ul style={{ paddingLeft: 20, listStyle: "disc", marginBottom: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          <li><strong>Supabase</strong>（データベース・認証基盤。データは東京リージョンで管理）</li>
          <li><strong>Vercel</strong>（本サービスのホスティング）</li>
          <li>
            <strong>Anthropic社（Claude API）</strong>：自由作文・画像描写・長文要約として入力いただいたテキストは、添削・フィードバック生成のためAnthropic社のAPIに送信されます。送信される内容は入力いただいたテキストそのものです。Anthropic社における取り扱いについては、同社のプライバシーポリシーをご参照ください
          </li>
        </ul>
        <p>上記以外の第三者に対して、法令に基づく場合を除き、個人情報を提供することはありません。</p>
      </Section>

      <Section title="4. Cookie等の利用">
        <p>本サービスは、ログイン状態の維持のため、Cookie等の技術を利用しています。広告目的でのトラッキングは行っていません。</p>
      </Section>

      <Section title="5. 保有個人データの開示・訂正・削除等について">
        <p>利用者ご本人から、ご自身の情報の開示・訂正・削除（アカウントの削除を含みます）等のご請求があった場合、本人確認の上、合理的な範囲で速やかに対応します。ご請求は下記「7. お問い合わせ」の窓口までご連絡ください。</p>
      </Section>

      <Section title="6. 情報の保管期間">
        <p>利用者の情報は、アカウントが存在する間、本サービスの提供に必要な範囲で保管します。アカウント削除のご請求をいただいた場合、法令上保存が必要なものを除き、速やかに削除します。</p>
      </Section>

      <Section title="7. お問い合わせ">
        <p style={{ marginBottom: 8 }}>本ポリシーに関するお問い合わせ、開示・削除等のご請求は、下記までご連絡ください。</p>
        <p>
          <a href="mailto:solsoralsol@gmail.com" style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "underline" }}>
            solsoralsol@gmail.com
          </a>
        </p>
      </Section>

      <Section title="8. 本ポリシーの変更">
        <p>本サービスの内容の変更等に伴い、本ポリシーを変更することがあります。変更後の内容は、本サービス内に掲載した時点から効力を生じるものとします。</p>
      </Section>

      <p style={{ fontSize: 13.2, color: "var(--ink-soft)" }}>制定日：2026年8月27日</p>
    </main>
  );
}
