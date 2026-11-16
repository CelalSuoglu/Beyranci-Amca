import { useState } from "react";
import { Button, Input, Message, Muted, Screen } from "../src/components/ui";
import { API_URL } from "../src/lib/api";
import { supabase } from "../src/lib/supabase";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Geçerli bir e-posta girin.");
    setPending(true);
    // Bağlantı web sitesinde yeni şifre sayfasını açar
    await supabase.auth
      .resetPasswordForEmail(email.trim(), { redirectTo: `${API_URL}/auth/callback?next=/sifre-yenile` })
      .catch(() => undefined);
    setPending(false);
    setDone(true);
  }

  return (
    <Screen edges={["left", "right", "bottom"]}>
      {done ? (
        <Message tone="success">
          Bu e-postaya kayıtlı bir hesap varsa şifre sıfırlama bağlantısı gönderildi. Yeni şifrenizi belirledikten sonra uygulamaya giriş yapabilirsiniz.
        </Message>
      ) : (
        <>
          <Muted style={{ marginBottom: 16 }}>E-posta adresinize şifre sıfırlama bağlantısı gönderelim.</Muted>
          <Input label="E-posta" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
          {error ? <Message>{error}</Message> : null}
          <Button label="Bağlantı gönder" onPress={() => void submit()} loading={pending} />
        </>
      )}
    </Screen>
  );
}
