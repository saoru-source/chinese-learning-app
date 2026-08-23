import { redirect } from "next/navigation";

// 「選択式」「ディクテーション」を選ぶだけのハブ画面だったが、新デザインでは
// 選択式/listening/choice側にタブUIとして両方への導線を統合したため、
// /listeningへのアクセス(ホーム画面の近日公開タイル等、既存のリンク先)は
// そのままchoiceへ転送する。
export default function ListeningPage() {
  redirect("/listening/choice");
}
