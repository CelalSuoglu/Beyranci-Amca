import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Card, Loading, Message, Muted, Screen } from "../../src/components/ui";
import { OrderProgress, StatusBadge, type ProgressEvent } from "../../src/components/OrderProgress";
import { apiFetch } from "../../src/lib/api";
import { formatOrderTime, formatTry, type OrderItemRecord, type OrderStatus } from "../../src/lib/orders";
import { colors } from "../../src/theme";

type Track = {
  order: {
    order_number: string;
    status: OrderStatus;
    items: OrderItemRecord[];
    total: number;
    created_at: string;
    eta_at: string | null;
    cancel_reason: string | null;
  };
  events: ProgressEvent[];
};

/** Misafir siparişi takibi (hesap olmadan, siparişe özel bağlantı anahtarı ile) */
export default function GuestTrackScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [data, setData] = useState<Track | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const res = await apiFetch<Track>(`/api/orders/track?token=${encodeURIComponent(token)}`);
    if (res.ok) {
      setData(res.data);
      setError(null);
    } else setError(res.error);
  }, [token]);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 15000);
    return () => clearInterval(t);
  }, [load]);

  if (error && !data) {
    return (
      <Screen edges={["left", "right", "bottom"]}>
        <Message>{error}</Message>
      </Screen>
    );
  }
  if (!data) return <Loading />;

  return (
    <Screen edges={["left", "right", "bottom"]}>
      <Card>
        <Text style={{ color: colors.goldLight, fontSize: 22, fontWeight: "700" }}>{data.order.order_number}</Text>
        <Text style={{ color: colors.muted, marginBottom: 12 }}>{formatOrderTime(data.order.created_at)}</Text>
        <StatusBadge status={data.order.status} />
        <View style={{ marginTop: 16 }}>
          <OrderProgress
            status={data.order.status}
            events={data.events}
            etaAt={data.order.eta_at}
            cancelReason={data.order.cancel_reason}
          />
        </View>
      </Card>
      <Card>
        {data.order.items.map((it, i) => (
          <Text key={i} style={{ color: colors.foreground, paddingVertical: 3 }}>
            {it.quantity}× {it.name}
          </Text>
        ))}
        <Text style={{ color: colors.goldLight, fontWeight: "700", marginTop: 8 }}>Toplam {formatTry(Number(data.order.total))}</Text>
      </Card>
      <Muted>Bu ekran otomatik güncellenir. Siparişlerinizi her zaman görmek ve bildirim almak için üye olabilirsiniz.</Muted>
      <Button label="Üye ol" variant="outline" onPress={() => router.push("/kayit")} style={{ marginTop: 12 }} />
    </Screen>
  );
}
