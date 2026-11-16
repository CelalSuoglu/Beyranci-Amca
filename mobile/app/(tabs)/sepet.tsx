import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useCart } from "../../src/context/CartContext";
import { Button, Card, Chip, Input, Message, Muted, Screen, Title } from "../../src/components/ui";
import { apiFetch, newIdempotencyKey } from "../../src/lib/api";
import { StoreBanner } from "../../src/components/StoreBanner";
import { useStore } from "../../src/lib/useStore";
import { registerForPush } from "../../src/lib/notifications";
import {
  MAX_DELIVERY_KM,
  MIN_ORDER_TOTAL_TL,
  PAYMENT_METHOD_LABELS,
  formatTry,
  normalizeTurkishPhone,
} from "../../src/lib/orders";
import { supabase } from "../../src/lib/supabase";
import { colors } from "../../src/theme";

type SavedAddress = { id: string; label: string; address: string; is_default: boolean };
type OrderResponse = { orderId: string; orderNumber: string; total: number; trackingToken: string };

export default function CartScreen() {
  const { session, profile } = useAuth();
  const { lines, subtotal, setQuantity, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<"cash" | "card">("cash");
  const [cashChangeFor, setCashChangeFor] = useState("");
  const [wantsCutlery, setWantsCutlery] = useState(false);
  const store = useStore();
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const idemKey = useRef<string | null>(null);

  // Giriş yapan müşterinin bilgileri ve kayıtlı adresleri otomatik dolar
  useEffect(() => {
    if (profile?.full_name) setName((v) => v || profile.full_name || "");
    if (profile?.phone) setPhone((v) => v || profile.phone || "");
  }, [profile]);

  useEffect(() => {
    if (!session) {
      setSaved([]);
      return;
    }
    supabase
      .from("addresses")
      .select("id, label, address, is_default")
      .order("is_default", { ascending: false })
      .then(({ data }) => {
        const list = (data ?? []) as SavedAddress[];
        setSaved(list);
        const preferred = list.find((a) => a.is_default) ?? list[0];
        if (preferred) setAddress((v) => v || preferred.address);
      });
  }, [session]);

  const meetsMin = subtotal >= MIN_ORDER_TOTAL_TL;

  async function submit() {
    if (sending) return;
    setError(null);
    if (!store.status.open) return setError(store.status.message);
    if (!meetsMin) return setError(`Minimum sipariş tutarı ${formatTry(MIN_ORDER_TOTAL_TL)}.`);
    const change = cashChangeFor.trim() ? Number(cashChangeFor.replace(/\./g, "").replace(",", ".")) : null;
    if (payment === "cash" && change !== null && (!Number.isFinite(change) || change < subtotal)) {
      return setError(`Para üstü için yazdığınız tutar sipariş toplamından (${formatTry(subtotal)}) az olamaz.`);
    }
    if (name.trim().length < 3) return setError("Ad soyad en az 3 karakter olmalı.");
    if (!normalizeTurkishPhone(phone)) return setError("Geçerli bir cep telefonu girin (05XX XXX XX XX).");
    if (address.trim().length < 10) return setError("Teslimat adresini mahalle, sokak ve ilçe ile yazın.");

    if (!idemKey.current) idemKey.current = newIdempotencyKey();
    setSending(true);
    const res = await apiFetch<OrderResponse>("/api/orders", {
      method: "POST",
      headers: { "Idempotency-Key": idemKey.current },
      body: JSON.stringify({
        customerName: name.trim(),
        phone,
        address: address.trim(),
        note: note.trim(),
        paymentMethod: payment,
        cashChangeFor: payment === "cash" ? change : null,
        wantsCutlery,
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          ...(l.spiceLevel ? { spiceLevel: l.spiceLevel } : {}),
          ...(l.garlicLevel ? { garlicLevel: l.garlicLevel } : {}),
        })),
      }),
    });
    setSending(false);

    if (!res.ok) {
      // Ağ hatasında aynı anahtar korunur: tekrar denemede çift sipariş oluşmaz
      setError(res.error);
      if (res.status === 409) void store.reload();
      return;
    }

    idemKey.current = null;
    clear();
    setNote("");
    setCashChangeFor("");
    if (session) {
      router.push(`/siparis/${res.data.orderId}`);
      // Bildirim iznini bağlam içinde iste: sipariş durumu için
      Alert.alert(
        "Sipariş alındı",
        `${res.data.orderNumber} numaralı siparişiniz mutfağa iletildi. Durum değişince bildirim almak ister misiniz?`,
        [
          { text: "Şimdi değil", style: "cancel" },
          { text: "Evet", onPress: () => void registerForPush({ prompt: true }) },
        ],
      );
    } else {
      router.push(`/takip/${res.data.trackingToken}`);
    }
  }

  if (lines.length === 0) {
    return (
      <Screen>
        <Title eyebrow="Sepet">Sepetiniz boş</Title>
        <Muted>Menüden ürün ekleyerek başlayın.</Muted>
        <Button label="Menüye git" onPress={() => router.push("/")} style={{ marginTop: 18 }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title eyebrow="Sepet">Siparişi tamamla</Title>
      <StoreBanner settings={store.settings} status={store.status} />

      <Card>
        {lines.map((l) => (
          <View key={l.key} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>{l.displayName}</Text>
              <Text style={{ color: colors.muted, fontSize: 13 }}>{formatTry(l.product.unitPrice)} × {l.quantity}</Text>
            </View>
            <Stepper value={l.quantity} onChange={(q) => setQuantity(l.key, q)} label={l.displayName} />
            <Text style={{ color: colors.goldLight, fontWeight: "700", minWidth: 82, textAlign: "right" }}>{formatTry(l.lineTotal)}</Text>
          </View>
        ))}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
          <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 17 }}>Toplam</Text>
          <Text style={{ color: colors.goldLight, fontWeight: "800", fontSize: 17 }}>{formatTry(subtotal)}</Text>
        </View>
        {!meetsMin ? (
          <Text style={{ color: colors.danger, marginTop: 8 }}>Minimum tutara {formatTry(MIN_ORDER_TOTAL_TL - subtotal)} kaldı.</Text>
        ) : null}
      </Card>

      {!session ? (
        <Message tone="info">
          Üye olmadan sipariş verebilirsiniz. Giriş yaparsanız bilgileriniz dolar ve siparişlerinizi takip edebilirsiniz.
        </Message>
      ) : null}
      {!session ? (
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
          <Button label="Giriş yap" variant="outline" onPress={() => router.push("/giris")} style={{ flex: 1 }} />
          <Button label="Üye ol" variant="outline" onPress={() => router.push("/kayit")} style={{ flex: 1 }} />
        </View>
      ) : null}

      <Input label="Ad soyad" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
      <Input label="Cep telefonu" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" placeholder="05XX XXX XX XX" />
      {saved.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {saved.map((a) => (
            <Chip key={a.id} label={a.label} selected={address === a.address} onPress={() => setAddress(a.address)} />
          ))}
        </View>
      ) : null}
      <Input
        label="Teslimat adresi"
        value={address}
        onChangeText={setAddress}
        multiline
        placeholder="Mahalle, sokak, bina no, ilçe"
        autoComplete="street-address"
        textContentType="fullStreetAddress"
        hint={`${MAX_DELIVERY_KM} km üzerindeki adreslere teslimat yapılmaz.`}
      />
      <Input label="Sipariş notu (isteğe bağlı)" value={note} onChangeText={setNote} multiline maxLength={500} />

      <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 8 }}>Ödeme yöntemi</Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 18 }} accessibilityRole="radiogroup">
        {(["cash", "card"] as const).map((m) => (
          <Chip key={m} label={PAYMENT_METHOD_LABELS[m]} selected={payment === m} onPress={() => setPayment(m)} />
        ))}
      </View>

      {payment === "cash" ? (
        <Input
          label="Kaç TL ile ödeyeceksiniz? (isteğe bağlı)"
          value={cashChangeFor}
          onChangeText={(v) => setCashChangeFor(v.replace(/[^0-9.,]/g, ""))}
          keyboardType="number-pad"
          placeholder={`Örn. ${Math.max(2000, Math.ceil((subtotal || 1) / 500) * 500)}`}
          hint="Kurye para üstünü hazırlayıp gelsin. Tam para verecekseniz boş bırakın."
        />
      ) : null}

      <Pressable
        onPress={() => setWantsCutlery((v) => !v)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: wantsCutlery }}
        style={{ flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 18 }}
      >
        <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: wantsCutlery ? colors.gold : colors.borderStrong, backgroundColor: wantsCutlery ? colors.gold : "transparent", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
          {wantsCutlery ? <Text style={{ color: colors.accentForeground, fontWeight: "800" }}>✓</Text> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground }}>Plastik çatal-bıçak ve peçete istiyorum</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>İstemiyorsanız işaretlemeyin, israfı birlikte azaltalım.</Text>
        </View>
      </Pressable>

      {error ? <Message>{error}</Message> : null}
      <Button
        label={!store.status.open ? "Şu an sipariş alınmıyor" : sending ? "Gönderiliyor…" : `Siparişi onayla · ${formatTry(subtotal)}`}
        onPress={() => void submit()}
        loading={sending}
        disabled={!meetsMin || !store.status.open}
      />
    </Screen>
  );
}

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 999 }}>
      <Pressable onPress={() => onChange(value - 1)} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }} accessibilityLabel={`${label} azalt`}>
        <Text style={{ color: colors.foreground, fontSize: 18 }}>−</Text>
      </Pressable>
      <Text style={{ color: colors.foreground, minWidth: 20, textAlign: "center" }}>{value}</Text>
      <Pressable onPress={() => onChange(value + 1)} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }} accessibilityLabel={`${label} artır`}>
        <Text style={{ color: colors.foreground, fontSize: 18 }}>+</Text>
      </Pressable>
    </View>
  );
}
