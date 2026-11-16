import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { Button, Loading, Muted, Screen, Title } from "../../src/components/ui";
import { StatusBadge } from "../../src/components/OrderProgress";
import { formatOrderTime, formatTry, type OrderStatus } from "../../src/lib/orders";
import { supabase } from "../../src/lib/supabase";
import { colors } from "../../src/theme";

type Row = { id: string; order_number: string; status: OrderStatus; total: number; created_at: string };

export default function MyOrdersScreen() {
  const { session, ready } = useAuth();
  const [orders, setOrders] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const userId = session?.user.id;

  const load = useCallback(async () => {
    if (!userId) return;
    // Personel tüm siparişleri görebildiği için kendi siparişleri açıkça süzülür
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, status, total, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    setOrders(((data ?? []) as Row[]).map((r) => ({ ...r, total: Number(r.total) })));
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  useEffect(() => {
    if (!userId) return;
    const ch = supabase
      .channel(`my-orders-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${userId}` }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [userId, load]);

  if (!ready) return <Loading />;

  if (!session) {
    return (
      <Screen>
        <Title eyebrow="Siparişlerim">Siparişlerinizi takip edin</Title>
        <Muted>Geçmiş siparişlerinizi ve canlı durumunu görmek için giriş yapın.</Muted>
        <Button label="Giriş yap" onPress={() => router.push("/giris")} style={{ marginTop: 18 }} />
        <Button label="Üye ol" variant="outline" onPress={() => router.push("/kayit")} style={{ marginTop: 10 }} />
      </Screen>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "left", "right"]}>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListHeaderComponent={<Title eyebrow="Hesabım">Siparişlerim</Title>}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.gold}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={
          loading ? null : (
            <View>
              <Muted>Henüz siparişiniz yok.</Muted>
              <Button label="Menüye git" onPress={() => router.push("/")} style={{ marginTop: 16 }} />
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/siparis/${item.id}`)}
            style={({ pressed }) => [
              { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 },
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
              <View>
                <Text style={{ color: colors.goldLight, fontWeight: "700", fontSize: 17 }}>{item.order_number}</Text>
                <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>{formatOrderTime(item.created_at)}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <StatusBadge status={item.status} />
                <Text style={{ color: colors.foreground, fontWeight: "700" }}>{formatTry(item.total)}</Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
