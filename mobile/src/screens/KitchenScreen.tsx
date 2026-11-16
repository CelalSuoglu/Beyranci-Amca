import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useKeepAwake } from "expo-keep-awake";
import type { RealtimeChannel, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  ETA_OPTIONS,
  formatTry,
  normalizeOrder,
  startOfTodayTR,
  type OrderRecord,
  type OrderStatus,
} from "../lib/orders";
import { initAlarm, playAlarm, releaseAlarm } from "../lib/alarm";
import { useStore } from "../lib/useStore";
import { apiFetch } from "../lib/api";
import { registerForPush } from "../lib/notifications";
import { OrderCard } from "../components/OrderCard";
import { colors } from "../theme";

type FilterKey = "all" | "new" | "preparing" | "ready" | "completed" | "cancelled";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "new", label: "Yeni" },
  { key: "preparing", label: "Hazırlanıyor" },
  { key: "ready", label: "Hazır" },
  { key: "completed", label: "Tamamlandı" },
  { key: "cancelled", label: "İptal" },
];

type Connection = "connecting" | "live" | "disconnected";

export function KitchenScreen({ session }: { session: Session }) {
  useKeepAwake(); // mutfak tableti/telefonu ekranı kapatmasın

  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 2 : 1;

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<Connection>("connecting");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [banner, setBanner] = useState<string | null>(null);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const knownIds = useRef<Set<string>>(new Set());
  const initialLoadDone = useRef(false);
  const appActive = useRef(AppState.currentState === "active");

  useEffect(() => {
    void initAlarm();
    // Personel paneli açılınca bildirim izni istenir: uygulama kapalıyken de yeni sipariş haberi gelsin
    void registerForPush({ prompt: true });
    return () => releaseAlarm();
  }, []);

  /** "x dk önce" sayaçları için dakikada bir yenile */
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const announce = useCallback((candidates: OrderRecord[]) => {
    const unseen = candidates.filter((o) => !knownIds.current.has(o.id));
    if (unseen.length === 0) return;
    unseen.forEach((o) => knownIds.current.add(o.id));

    setBanner(
      unseen.length === 1
        ? `Yeni sipariş: ${unseen[0].order_number}`
        : `${unseen.length} yeni sipariş geldi`,
    );
    setHighlightIds((h) => {
      const next = new Set(h);
      unseen.forEach((o) => next.add(o.id));
      return next;
    });
    void playAlarm();

    setTimeout(() => {
      setHighlightIds((h) => {
        const next = new Set(h);
        unseen.forEach((o) => next.delete(o.id));
        return next;
      });
    }, 12000);
  }, []);

  const loadOrders = useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        const { data, error: fetchError } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);

        if (fetchError) {
          if (!opts?.silent) {
            setError("Siparişler yüklenemedi. Oturumunuzu kontrol edin.");
          }
          return;
        }

        const list = (data ?? []).map((row) =>
          normalizeOrder(row as Record<string, unknown>),
        );

        if (initialLoadDone.current) {
          announce(list);
        }
        knownIds.current = new Set(list.map((o) => o.id));
        setOrders(list);
        setError(null);
      } catch {
        if (!opts?.silent) setError("Bağlantı kurulamadı.");
      } finally {
        setLoading(false);
        initialLoadDone.current = true;
      }
    },
    [announce],
  );

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  /** Realtime kaçsa bile sipariş kaçmasın: 6 sn'de bir yenile (uygulama açıkken) */
  useEffect(() => {
    const poll = setInterval(() => {
      if (appActive.current) void loadOrders({ silent: true });
    }, 6000);
    const sub = AppState.addEventListener("change", (state) => {
      appActive.current = state === "active";
      if (state === "active") void loadOrders({ silent: true });
    });
    return () => {
      clearInterval(poll);
      sub.remove();
    };
  }, [loadOrders]);

  /** Supabase Realtime — web panelindekiyle aynı kanal mantığı */
  useEffect(() => {
    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      if (cancelled) return;
      setConnection("connecting");

      const ch = supabase
        .channel(`kitchen-orders-${session.user.id}-${Date.now()}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          (payload) => {
            if (payload.eventType === "INSERT" && payload.new) {
              const order = normalizeOrder(payload.new as Record<string, unknown>);
              setOrders((prev) =>
                prev.some((o) => o.id === order.id) ? prev : [order, ...prev],
              );
              if (initialLoadDone.current) {
                announce([order]);
              } else {
                knownIds.current.add(order.id);
              }
            }

            if (payload.eventType === "UPDATE" && payload.new) {
              const order = normalizeOrder(payload.new as Record<string, unknown>);
              setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
            }

            if (payload.eventType === "DELETE" && payload.old) {
              const id = String((payload.old as Record<string, unknown>).id ?? "");
              if (!id) return;
              setOrders((prev) => prev.filter((o) => o.id !== id));
              knownIds.current.delete(id);
            }
          },
        );

      channel = ch;

      ch.subscribe((status) => {
        if (cancelled || ch !== channel) return;
        if (status === "SUBSCRIBED") {
          setConnection("live");
          return;
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setConnection("disconnected");
          channel = null;
          void supabase.removeChannel(ch);
          retryTimer = setTimeout(connect, 4000);
        }
      });
    };

    connect();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (channel) {
        const ch = channel;
        channel = null;
        void supabase.removeChannel(ch);
      }
    };
  }, [session.user.id, announce]);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 8000);
    return () => clearTimeout(t);
  }, [banner]);

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus, extra?: { etaMinutes?: number; cancelReason?: string }) => {
      setUpdatingId(orderId);
      setError(null);
      // Sunucu: yetki + geçiş kuralı kontrolü ve müşteriye bildirim
      const res = await apiFetch<{ ok: boolean; etaAt?: string | null; cancelReason?: string | null }>(
        `/api/orders/${orderId}/status`,
        { method: "PATCH", body: JSON.stringify({ status, ...extra }) },
      );
      if (!res.ok) {
        setError(res.error);
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status, eta_at: res.data.etaAt ?? o.eta_at, cancel_reason: res.data.cancelReason ?? o.cancel_reason }
              : o,
          ),
        );
      }
      setUpdatingId(null);
    },
    [],
  );

  const store = useStore();
  const [storeBusy, setStoreBusy] = useState(false);
  const defaultEta: number =
    ETA_OPTIONS.find((m) => m >= store.settings.eta_max) ?? ETA_OPTIONS[ETA_OPTIONS.length - 1];

  const toggleOrders = useCallback(() => {
    const next = !store.settings.orders_enabled;
    const run = async () => {
      setStoreBusy(true);
      const res = await apiFetch<{ ok: boolean }>("/api/store", {
        method: "PATCH",
        body: JSON.stringify({ orders_enabled: next }),
      });
      if (!res.ok) setError(res.error);
      await store.reload();
      setStoreBusy(false);
    };
    if (next) {
      void run();
      return;
    }
    Alert.alert("Siparişleri durdur", "Online siparişler siz tekrar açana kadar durdurulsun mu?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Durdur", style: "destructive", onPress: () => void run() },
    ]);
  }, [store]);

  const onChangeStatus = useCallback(
    (order: OrderRecord, status: OrderStatus, extra?: { etaMinutes?: number; cancelReason?: string }) => {
      if (updatingId) return;
      // İptal nedeni kartta seçilir (müşteriye gösterilir)
      void updateStatus(order.id, status, extra);
    },
    [updatingId, updateStatus],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);


  const summary = useMemo(() => {
    const since = startOfTodayTR(now);
    const today = orders.filter((o) => new Date(o.created_at).getTime() >= since && o.status !== "cancelled");
    return {
      waiting: orders.filter((o) => o.status === "new").length,
      count: today.length,
      revenue: today.reduce((sum, o) => sum + o.total, 0),
    };
  }, [orders, now]);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: orders.length,
      new: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const o of orders) {
      if (o.status in c) c[o.status as FilterKey] += 1;
    }
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    const qDigits = q.replace(/\s/g, "");
    return orders.filter((order) => {
      if (filter !== "all" && order.status !== filter) return false;
      if (!q) return true;
      return (
        order.order_number.toLowerCase().includes(q) ||
        order.phone.replace(/\s/g, "").includes(qDigits) ||
        order.customer_name.toLocaleLowerCase("tr-TR").includes(q)
      );
    });
  }, [orders, filter, query]);

  const header = (
    <View style={styles.headerWrap}>
      {banner ? (
        <View style={styles.banner} accessibilityLiveRegion="assertive">
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      ) : null}

      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>BEYRANCI AMCA</Text>
          <Text style={styles.title}>Mutfak paneli</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    connection === "live"
                      ? colors.success
                      : connection === "connecting"
                        ? colors.warning
                        : colors.danger,
                },
              ]}
            />
            <Text style={styles.statusText}>
              {connection === "live"
                ? "Canlı"
                : connection === "connecting"
                  ? "Bağlanıyor…"
                  : "Kesildi — siparişler yenilenmeye devam eder"}
            </Text>
          </View>
        </View>
        <View style={styles.topButtons}>
          <SmallButton label="Ses test et" onPress={() => void playAlarm()} />
        </View>
      </View>

      <View style={styles.summaryRow}>
        <SummaryBox label="Bekleyen" value={String(summary.waiting)} warn={summary.waiting > 0} />
        <SummaryBox label="Bugün" value={String(summary.count)} />
        <SummaryBox label="Ciro" value={formatTry(summary.revenue)} />
      </View>

      <View
        style={[
          styles.storeBox,
          store.status.open
            ? { borderColor: "rgba(16,185,129,0.35)", backgroundColor: "rgba(6,78,59,0.3)" }
            : { borderColor: "rgba(239,68,68,0.45)", backgroundColor: colors.dangerBg },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground, fontWeight: "700" }}>
            {store.settings.orders_enabled
              ? store.status.open
                ? "Online siparişler açık"
                : "Saat dışı — sipariş alınmıyor"
              : "Online siparişler DURDURULDU"}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{store.status.message}</Text>
        </View>
        <SmallButton
          label={storeBusy ? "…" : store.settings.orders_enabled ? "Durdur" : "Aç"}
          onPress={toggleOrders}
        />
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Sipariş no, telefon veya isim ara…"
        placeholderTextColor={colors.muted}
        style={styles.search}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((item) => {
          const selected = filter === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setFilter(item.key)}
              style={[styles.chip, selected && styles.chipSelected]}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {item.label}
                {counts[item.key] > 0 ? `  ${counts[item.key]}` : ""}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error ? (
        <View style={styles.error}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {loading ? (
        <>
          {header}
          <View style={styles.center}>
            <ActivityIndicator color={colors.gold} size="large" />
            <Text style={styles.muted}>Siparişler yükleniyor…</Text>
          </View>
        </>
      ) : (
        <FlatList
          key={`cols-${columns}`}
          data={filtered}
          numColumns={columns}
          keyExtractor={(o) => o.id}
          ListHeaderComponent={header}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={columns > 1 ? styles.columnWrap : undefined}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void onRefresh()}
              tintColor={colors.gold}
              colors={[colors.gold]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.muted}>Bu filtrede sipariş yok.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={columns > 1 ? styles.half : undefined}>
              <OrderCard
                order={item}
                highlighted={highlightIds.has(item.id)}
                busy={updatingId === item.id}
                now={now}
                defaultEta={defaultEta}
                onChangeStatus={onChangeStatus}
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function SummaryBox({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, warn && { color: "#fed7aa" }]}>{value}</Text>
    </View>
  );
}

function SmallButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.smallBtn, pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
    >
      <Text style={styles.smallBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerWrap: { paddingBottom: 14, gap: 14 },
  listContent: { padding: 16, paddingBottom: 40 },
  columnWrap: { gap: 14 },
  half: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  banner: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.5)",
    backgroundColor: "rgba(212,175,55,0.15)",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  bannerText: { color: colors.goldPale, fontWeight: "700", textAlign: "center", fontSize: 16 },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  brand: { color: colors.gold, fontSize: 11, fontWeight: "700", letterSpacing: 2.5 },
  title: { color: colors.foreground, fontSize: 26, fontWeight: "700", marginTop: 2 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: colors.muted, fontSize: 13, flexShrink: 1 },
  topButtons: { gap: 8 },
  smallBtn: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtnText: { color: colors.foreground, fontWeight: "600", fontSize: 13 },
  summaryRow: { flexDirection: "row", gap: 8 },
  summaryBox: { flex: 1, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 10 },
  summaryLabel: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  summaryValue: { color: colors.foreground, fontSize: 18, fontWeight: "700", marginTop: 2 },
  storeBox: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  search: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.foreground,
    fontSize: 15,
  },
  filters: { gap: 8, paddingRight: 8 },
  chip: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    justifyContent: "center",
  },
  chipSelected: { borderColor: "rgba(212,175,55,0.55)", backgroundColor: "rgba(212,175,55,0.15)" },
  chipText: { color: colors.muted, fontWeight: "600", fontSize: 14 },
  chipTextSelected: { color: colors.goldPale },
  error: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    backgroundColor: colors.dangerBg,
    padding: 10,
  },
  errorText: { color: colors.danger, fontSize: 14 },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingVertical: 40,
    alignItems: "center",
  },
  muted: { color: colors.muted },
});
