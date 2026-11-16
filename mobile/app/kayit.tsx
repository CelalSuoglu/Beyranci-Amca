import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Input, Message, Screen } from "../src/components/ui";
import { API_URL } from "../src/lib/api";
import { normalizeTurkishPhone } from "../src/lib/orders";
import { supabase } from "../src/lib/supabase";
import { colors } from "../src/theme";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    if (pending) return;
    setError(null);
    const p = normalizeTurkishPhone(phone);
    if (fullName.trim().length < 3) return setError("Ad soyad en az 3 karakter olmalı.");
    if (!p) return setError("Geçerli bir cep telefonu girin.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Geçerli bir e-posta girin.");
    if (password.length < 8 || !/\d/.test(password) || !/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(password)) {
      return setError("Şifre en az 8 karakter olmalı, harf ve rakam içermeli.");
    }
    if (password !== password2) return setError("Şifreler aynı değil.");
    if (!consent) return setError("Devam etmek için Kullanım Koşulları'nı kabul edin.");

    setPending(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Rol gönderilmez: sunucu her yeni hesabı müşteri olarak açar
        data: { full_name: fullName.trim(), phone: p },
        emailRedirectTo: `${API_URL}/auth/callback?next=/hesabim`,
      },
    });
    setPending(false);
    if (err) {
      setError(/registered|exists/i.test(err.message) ? "Bu e-posta ile kayıtlı bir hesap var." : "Kayıt oluşturulamadı. Bilgileri kontrol edin.");
      return;
    }
    if (data.session) {
      router.replace("/");
      return;
    }
    setSentTo(email.trim());
  }

  if (sentTo) {
    return (
      <Screen edges={["left", "right", "bottom"]}>
        <Message tone="success">
          {sentTo} adresine doğrulama bağlantısı gönderdik. Bağlantıya tıkladıktan sonra uygulamaya dönüp giriş yapabilirsiniz.
        </Message>
        <Button label="Giriş ekranına git" onPress={() => router.replace("/giris")} />
      </Screen>
    );
  }

  return (
    <Screen edges={["left", "right", "bottom"]}>
      <Input label="Ad soyad" value={fullName} onChangeText={setFullName} autoComplete="name" textContentType="name" />
      <Input label="Cep telefonu" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" placeholder="05XX XXX XX XX" />
      <Input label="E-posta" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
      <Input label="Şifre" value={password} onChangeText={setPassword} secureTextEntry textContentType="newPassword" autoComplete="new-password" hint="En az 8 karakter, harf ve rakam." />
      <Input label="Şifre (tekrar)" value={password2} onChangeText={setPassword2} secureTextEntry textContentType="newPassword" />
      <Pressable onPress={() => setConsent((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: consent }} style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
        <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: consent ? colors.gold : colors.borderStrong, backgroundColor: consent ? colors.gold : "transparent", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
          {consent ? <Text style={{ color: colors.accentForeground, fontWeight: "800" }}>✓</Text> : null}
        </View>
        <Text style={{ color: colors.muted, flex: 1, lineHeight: 20 }}>
          <Text onPress={() => void Linking.openURL(`${API_URL}/kullanim-kosullari`)} style={{ color: colors.accentSoft }}>
            Kullanım Koşulları
          </Text>
          {"'nı kabul ediyorum. Kişisel verilerimin "}
          <Text onPress={() => void Linking.openURL(`${API_URL}/gizlilik`)} style={{ color: colors.accentSoft }}>
            KVKK Aydınlatma Metni
          </Text>
          {" kapsamında işleneceği konusunda bilgilendirildim."}
        </Text>
      </Pressable>
      {error ? <Message>{error}</Message> : null}
      <Button label="Üye ol" onPress={() => void submit()} loading={pending} />
    </Screen>
  );
}
