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

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Link href="/profile" aria-label="マイページに戻る" style={{ display: "flex", alignItems: "center" }}>
          <BackArrowIcon />
        </Link>
        <h1 style={{ fontSize: 19.2, fontWeight: 700, color: "var(--ink)" }}>利用規約</h1>
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
        本利用規約（以下「本規約」といいます）は、SOLSORAL（以下「運営者」といいます）が提供するアプリ「中文一途（仮）」（以下「本サービス」といいます）の利用条件を定めるものです。利用者の皆様には、本規約に従って本サービスをご利用いただきます。
      </p>

      <Section title="第1条（適用）">
        <p>本規約は、利用者と運営者との間の本サービスの利用に関わる一切の関係に適用されます。</p>
      </Section>

      <Section title="第2条（利用登録）">
        <ol style={{ paddingLeft: 20, listStyle: "decimal", display: "flex", flexDirection: "column", gap: 6 }}>
          <li>本サービスの利用を希望する方は、本規約に同意の上、運営者の定める方法によって利用登録を行うものとします。</li>
          <li>
            運営者は、利用登録の申請者に以下の事由があると判断した場合、利用登録を承認しないことがあります。
            <ul style={{ paddingLeft: 20, listStyle: "disc", marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
              <li>虚偽の情報を届け出た場合</li>
              <li>本規約に違反したことがある者からの申請である場合</li>
              <li>その他、運営者が利用登録を適当でないと判断した場合</li>
            </ul>
          </li>
        </ol>
      </Section>

      <Section title="第3条（禁止事項）">
        <p style={{ marginBottom: 8 }}>利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
        <ol style={{ paddingLeft: 20, listStyle: "decimal", display: "flex", flexDirection: "column", gap: 6 }}>
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>運営者、他の利用者、または第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
          <li>本サービスのサーバーやネットワークの機能を破壊・妨害する行為</li>
          <li>本サービスによって得られた情報を商業的に利用する行為</li>
          <li>他の利用者に成りすます行為</li>
          <li>不正アクセスをし、またはこれを試みる行為</li>
          <li>その他、運営者が不適切と判断する行為</li>
        </ol>
      </Section>

      <Section title="第4条（本サービスの提供の停止等）">
        <p style={{ marginBottom: 8 }}>
          運営者は、以下のいずれかの事由があると判断した場合、利用者に事前に通知することなく本サービスの全部または一部の提供を停止または中断することができます。
        </p>
        <ol style={{ paddingLeft: 20, listStyle: "decimal", display: "flex", flexDirection: "column", gap: 6 }}>
          <li>本サービスにかかるシステムの保守点検または更新を行う場合</li>
          <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
          <li>その他、運営者が本サービスの提供が困難と判断した場合</li>
        </ol>
      </Section>

      <Section title="第5条（AI機能に関する免責事項）">
        <ol style={{ paddingLeft: 20, listStyle: "decimal", display: "flex", flexDirection: "column", gap: 6 }}>
          <li>本サービスは、利用者が入力した文章等について、AI（外部の生成AIサービス）を用いた添削・フィードバックを提供します。当該フィードバックの内容の正確性・完全性・有用性について、運営者は保証しません。</li>
          <li>AIによる生成物は学習の参考としてご利用いただくものであり、最終的な学習成果について運営者は責任を負いません。</li>
        </ol>
      </Section>

      <Section title="第6条（免責事項）">
        <ol style={{ paddingLeft: 20, listStyle: "decimal", display: "flex", flexDirection: "column", gap: 6 }}>
          <li>運営者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます）がないことを保証しません。</li>
          <li>運営者は、本サービスに起因して利用者に生じたあらゆる損害について、運営者の故意または重過失による場合を除き、一切の責任を負いません。</li>
        </ol>
      </Section>

      <Section title="第7条（サービス内容の変更等）">
        <p>運営者は、利用者に通知することなく、本サービスの内容を変更、追加または廃止することがあり、利用者はこれを承諾するものとします。</p>
      </Section>

      <Section title="第8条（利用規約の変更）">
        <p>運営者は、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。変更後の利用規約は、本サービス内に掲載した時点から効力を生じるものとします。</p>
      </Section>

      <Section title="第9条（準拠法・裁判管轄）">
        <ol style={{ paddingLeft: 20, listStyle: "decimal", display: "flex", flexDirection: "column", gap: 6 }}>
          <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
          <li>本サービスに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を専属的合意管轄とします。</li>
        </ol>
      </Section>

      <p style={{ fontSize: 13.2, color: "var(--ink-soft)" }}>制定日：2026年8月27日</p>
    </main>
  );
}
