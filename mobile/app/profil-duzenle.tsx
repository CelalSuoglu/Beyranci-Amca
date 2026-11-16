import { useState } from "react";
import { router } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { Button, Input, Message, Screen } from "../src/components/ui";
import { normalizeTurkishPhone } from "../src/lib/orders";
import { supabase } from "../src/lib/supabase";

export default function EditProfileScreen() {
  const { session, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save() {
    if (!session) return;
    setError(null);
    const p = phone.trim() ? normalizeTurkishPhone(phone) : null;
    if (name.trim().length < 3) return setError("Ad soyad en az 3 karakter olmalı.");
    if (phone.trim() && !p) return setError("Geçerli bir cep telefonu girin.");
    setPending(true);
    // Rol kolonu veritabanında kilitli; yalnızca ad ve telefon güncellenebilir
    const { error: err } = await supabase.from("profiles").update({ full_name: name.trim(), phone: p }).eq("id", session.user.id);
    setPending(false);
    if (err) return setError("Kaydedilemedi.");
    await refreshProfile();
    router.back();
  }

  return (
    <Screen edges={["left", "right", "bottom"]}>
      <Input label="Ad soyad" value={name} onChangeText={setName} autoComplete="name" />
      <Input label="Cep telefonu" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="05XX XXX XX XX" />
      {error ? <Message>{error}</Message> : null}
      <Button label="Kaydet" onPress={() => void save()} loading={pending} />
    </Screen>
  );
}
