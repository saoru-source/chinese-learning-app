import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-[28.8px] font-bold">認証に失敗しました</h1>
      <p className="text-[16.8px] text-ink-soft">
        リンクの有効期限が切れているか、無効な可能性があります。
        もう一度お試しください。
      </p>
      <Link href="/login" className="text-[16.8px] text-ink-soft">
        ログイン画面に戻る
      </Link>
    </div>
  );
}
