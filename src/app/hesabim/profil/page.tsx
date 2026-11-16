import { Card } from "@/components/account/ui";
import { DeleteAccount, ProfileForm } from "@/components/account/ProfileForm";
import { ChangePasswordForm } from "@/components/account/PasswordForms";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h2 className="mb-4 text-lg font-semibold">İletişim bilgileri</h2>
        <ProfileForm
          userId={user.id}
          email={user.email ?? ""}
          initialName={(profile?.full_name as string | null) ?? ""}
          initialPhone={(profile?.phone as string | null) ?? ""}
        />
      </Card>
      <div className="space-y-4">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Şifre değiştir</h2>
          <ChangePasswordForm />
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Hesabı sil</h2>
          <DeleteAccount />
        </Card>
      </div>
    </div>
  );
}
