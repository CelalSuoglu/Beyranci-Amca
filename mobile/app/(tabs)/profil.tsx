import { useCallback, useState } from "react";
import { Alert, Linking, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { Button, Card, Loading, Message, Muted, Screen, Title } from "../../src/components/ui";
import { API_URL, apiFetch } from "../../src/lib/api";
import { getPushStatus, registerForPush, type PushStatus } from "../../src/lib/notifications";
import { colors } from "../../src/theme";

const ROLE_LABEL = { customer: "Müşteri", staff: "Personel", admin: "Yönetici" } as const;

export default function ProfileTab() {
  const { ready, session, profile, isAdmin, isStaff, signOut } = useAuth();
  const [push, setPush] = useState<PushStatus>("undetermined");
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getPushStatus().then(setPush);
    }, []),
  );

  if (!ready) return <Loading />;

  if (!session) {
    return (
      <Screen>
        <Title eyebrow="Hesabım">Hoş geldiniz</Title>
        <Muted>Giriş yaparak adreslerinizi kaydedebilir, siparişlerinizi canlı takip edebilirsiniz.</Muted>
        <Button label="Giriş yap" onPress={() => router.push("/giris")} style={{ marginTop: 18 }} />
        <Button label="Üye ol" variant="outline" onPress={() => router.push("/kayit")} style={{ marginTop: 10 }} />
        <LegalLinks />
      </Screen>
    );
  }

  function confirmDelete() {
    Alert.alert(
      "Hesabı sil",
      "Hesabınız, profiliniz ve adresleriniz kalıcı olarak silinir. Geçmiş siparişler işletme kaydı olarak kalır ama hesabınızla bağlantısı kaldırılır. Emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Hesabımı sil",
          style: "destructive",
          onPress: async () => {
            const res = await apiFetch<{ ok: boolean }>("/api/account", { method: "DELETE" });
            if (!res.ok) {
              setError(res.error);
              return;
            }
            await signOut();
            router.replace("/");
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <Title eyebrow="Hesabım">{profile?.full_name ?? "Hesabım"}</Title>
      <Card>
        <Text style={{ color: colors.muted, fontSize: 13 }}>E-posta</Text>
        <Text style={{ color: colors.foreground, marginBottom: 8 }}>{session.user.email}</Text>
        <Text style={{ color: colors.muted, fontSize: 13 }}>Telefon</Text>
        <Text style={{ color: colors.foreground, marginBottom: 8 }}>{profile?.phone ?? "—"}</Text>
        <Text style={{ color: colors.muted, fontSize: 13 }}>Hesap türü</Text>
        <Text style={{ color: colors.foreground }}>{ROLE_LABEL[profile?.role ?? "customer"]}</Text>
      </Card>

      <View style={{ gap: 10 }}>
        <Button label="Bilgilerimi düzenle" variant="outline" onPress={() => router.push("/profil-duzenle")} />
        <Button label="Adreslerim" variant="outline" onPress={() => router.push("/adresler")} />
        {isStaff ? <Button label="Sipariş paneli" variant="outline" onPress={() => router.push("/panel")} /> : null}
        {isAdmin ? (
          <Button label="Yönetim paneli (web)" variant="outline" onPress={() => void Linking.openURL(`${API_URL}/yonetim`)} />
        ) : null}
      </View>

      <Card style={{ marginTop: 16 }}>
        <Text style={{ color: colors.foreground, fontWeight: "700", marginBottom: 6 }}>Bildirimler</Text>
        {push === "granted" ? (
          <Muted>Açık. Sipariş durumları bildirimle gelir.</Muted>
        ) : push === "denied" ? (
          <>
            <Muted>Kapalı. Açmak için telefon ayarlarından izin verin.</Muted>
            <Button label="Ayarları aç" variant="outline" onPress={() => void Linking.openSettings()} style={{ marginTop: 10 }} />
          </>
        ) : push === "unsupported" ? (
          <Muted>Bu cihazda bildirim kullanılamıyor.</Muted>
        ) : (
          <Button label="Bildirimleri aç" variant="outline" onPress={() => void registerForPush({ prompt: true }).then(setPush)} />
        )}
      </Card>

      {error ? <Message>{error}</Message> : null}
      <Button label="Çıkış yap" variant="outline" onPress={() => void signOut()} style={{ marginTop: 4 }} />
      <Button label="Hesabımı sil" variant="danger" onPress={confirmDelete} style={{ marginTop: 10 }} />
      <LegalLinks />
    </Screen>
  );
}

const LEGAL_LINKS = [
  ["KVKK Aydınlatma Metni", "/gizlilik"],
  ["Ön Bilgilendirme Formu", "/on-bilgilendirme"],
  ["Mesafeli Satış Sözleşmesi", "/mesafeli-satis-sozlesmesi"],
  ["İptal ve İade", "/iptal-ve-iade"],
  ["Teslimat Koşulları", "/teslimat-kosullari"],
  ["Kullanım Koşulları", "/kullanim-kosullari"],
  ["Satıcı bilgileri", "/yasal"],
] as const;

function LegalLinks() {
  return (
    <View style={{ marginTop: 24, gap: 10, alignItems: "center" }} accessibilityRole="list">
      <Text style={{ color: colors.gold, fontSize: 11, fontWeight: "700", letterSpacing: 2 }}>YASAL</Text>
      {LEGAL_LINKS.map(([label, path]) => (
        <Text
          key={path}
          accessibilityRole="link"
          onPress={() => void Linking.openURL(`${API_URL}${path}`)}
          style={{ color: colors.muted, fontSize: 13 }}
        >
          {label}
        </Text>
      ))}
    </View>
  );
}
