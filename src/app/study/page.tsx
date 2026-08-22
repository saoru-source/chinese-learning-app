import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pickStepwiseSentence } from "@/lib/stepwise/select";
import StudyCard from "./StudyCard";

export default async function StudyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { sentence, knownWordCount } = await pickStepwiseSentence(
    supabase,
    user.id
  );

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">段階的暗記</h1>
        <Link href="/" className="text-sm underline">
          トップに戻る
        </Link>
      </div>
      <p className="mb-6 text-sm text-ink-soft">
        あなたが覚えた単語(緑のタグ)を使った例文が出題されます。
      </p>

      {sentence ? (
        <StudyCard sentence={sentence} />
      ) : knownWordCount === 0 ? (
        <p className="text-sm text-ink-soft">
          まだ覚えた単語がありません。まず
          <Link href="/quiz" className="underline">
            クイズ
          </Link>
          で単語を学習してみましょう。
        </p>
      ) : (
        <p className="text-sm text-ink-soft">
          今の既習単語({knownWordCount}語)を使える新しい例文が見つかりませんでした。
          もう少し単語を覚えると出題できる例文が増えます。
        </p>
      )}
    </div>
  );
}
