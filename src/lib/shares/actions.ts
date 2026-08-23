"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function shareItem(
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const recipientId = formData.get("recipientId") as string;
  const itemType = formData.get("itemType") as string;
  const itemId = Number(formData.get("itemId"));

  if (!recipientId || !itemType || !itemId) {
    return { ok: false, error: "共有先または対象が正しくありません。" };
  }

  const { error } = await supabase.from("shares").insert({
    sharer_id: user.id,
    recipient_id: recipientId,
    item_type: itemType,
    item_id: itemId,
  });

  if (error) {
    console.error("shareItem failed", error);
    return { ok: false, error: "共有に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath("/shares");
  return { ok: true };
}
