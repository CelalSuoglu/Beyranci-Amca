import { useState } from "react";
import { Text } from "react-native";
import { router } from "expo-router";
import { Button, Input, Message, Screen } from "../src/components/ui";
import { supabase } from "../src/lib/supabase";
import { colors } from "../src/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    if (pending) return;
    setError(null);
    if (!email.trim() || !password) return setError("E-posta ve şifre girin.");
    setPending(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setPending(false);
    if (err) {
      setError(/not confirmed/i.test(err.message) ? "E-postanızı henüz doğrulamadınız. Gelen kutunuzdaki bağlantıya tıklayın." : "E-posta veya şifre hatalı.");
      return;
    }
    // Personel/yönetici doğrudan panele, müşteri geldiği yere
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    if (profile?.role === "staff" || profile?.role === "admin") router.replace("/panel");
    else if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  return (
    <Screen edges={["left", "right", "bottom"]}>
      <Input label="E-posta" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" textContentType="username" />
      <Input label="Şifre" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" textContentType="password" returnKeyType="go" onSubmitEditing={() => void submit()} />
      {error ? <Message>{error}</Message> : null}
      <Button label="Giriş yap" onPress={() => void submit()} loading={pending} />
      <Text onPress={() => router.push("/sifremi-unuttum")} style={{ color: colors.accentSoft, textAlign: "center", marginTop: 18 }}>
        Şifremi unuttum
      </Text>
      <Text onPress={() => router.replace("/kayit")} style={{ color: colors.muted, textAlign: "center", marginTop: 14 }}>
        Hesabınız yok mu? <Text style={{ color: colors.accentSoft, fontWeight: "700" }}>Üye olun</Text>
      </Text>
    </Screen>
  );
}
