import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import { AuthProvider } from "../src/context/AuthContext";
import { CartProvider } from "../src/context/CartContext";
import { supabaseConfigured } from "../src/lib/supabase";
import { ensureChannels } from "../src/lib/notifications";
import { colors } from "../src/theme";

/** Bildirime dokununca ilgili ekran açılır */
function openFromNotification(response: Notifications.NotificationResponse | null) {
  const data = response?.notification.request.content.data as { type?: string; orderId?: string } | undefined;
  if (!data?.type) return;
  if (data.type === "staff_order") router.push("/panel");
  else if (data.type === "customer_order" && data.orderId) router.push(`/siparis/${data.orderId}`);
}

export default function RootLayout() {
  useEffect(() => {
    void ensureChannels();
    // Uygulama kapalıyken bildirime dokunulduysa
    void Notifications.getLastNotificationResponseAsync().then(openFromNotification);
    const sub = Notifications.addNotificationResponseReceivedListener(openFromNotification);
    return () => sub.remove();
  }, []);

  if (!supabaseConfigured) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "700" }}>Ayar eksik</Text>
        <Text style={{ color: colors.muted, textAlign: "center", marginTop: 8 }}>
          mobile/.env dosyasına Supabase değerlerini girip uygulamayı yeniden başlatın.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.foreground,
              headerTitleStyle: { fontWeight: "700" },
              headerBackTitle: "Geri",
              contentStyle: { backgroundColor: colors.background },
              gestureEnabled: true,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="urun/[id]" options={{ title: "Ürün", presentation: "modal" }} />
            <Stack.Screen name="siparis/[id]" options={{ title: "Sipariş" }} />
            <Stack.Screen name="takip/[token]" options={{ title: "Sipariş takibi" }} />
            <Stack.Screen name="giris" options={{ title: "Giriş yap" }} />
            <Stack.Screen name="kayit" options={{ title: "Üye ol" }} />
            <Stack.Screen name="sifremi-unuttum" options={{ title: "Şifremi unuttum" }} />
            <Stack.Screen name="profil-duzenle" options={{ title: "Bilgilerim" }} />
            <Stack.Screen name="adresler" options={{ title: "Adreslerim" }} />
          </Stack>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
