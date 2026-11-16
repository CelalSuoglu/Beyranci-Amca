import { memo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  STATUS_TRANSITIONS,
  formatElapsed,
  formatModifiers,
  formatOrderTime,
  formatPhoneDisplay,
  formatTry,
  phoneTelUrl,
  type OrderRecord,
  type OrderStatus,
} from "../lib/orders";
import { colors } from "../theme";

type Props = {
  order: OrderRecord;
  highlighted: boolean;
  busy: boolean;
  now: number;
  onChangeStatus: (order: OrderRecord, status: OrderStatus) => void;
};

const BADGE: Partial<Record<OrderStatus, { bg: string; fg: string }>> = {
  new: { bg: "rgba(249,115,22,0.2)", fg: "#fed7aa" },
  cancelled: { bg: "rgba(239,68,68,0.2)", fg: "#fecaca" },
  completed: { bg: "rgba(16,185,129,0.2)", fg: "#a7f3d0" },
};

function OrderCardBase({ order, highlighted, busy, now, onChangeStatus }: Props) {
  const transitions = STATUS_TRANSITIONS[order.status] ?? [];
  const badge = BADGE[order.status] ?? {
    bg: "rgba(255,255,255,0.1)",
    fg: colors.foreground,
  };
  const active = order.status !== "completed" && order.status !== "cancelled";

  return (
    <View style={[styles.card, highlighted && styles.highlighted]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.number}>{order.order_number}</Text>
          <Text style={styles.time}>
            {formatOrderTime(order.created_at)}
            {active ? `  ·  ${formatElapsed(order.created_at, now)} önce` : ""}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.fg }]}>
            {ORDER_STATUS_LABELS[order.status]}
          </Text>
        </View>
      </View>

      <Field label="Müşteri" value={order.customer_name} strong />
      <View style={styles.field}>
        <Text style={styles.label}>Telefon</Text>
        <Pressable onPress={() => void Linking.openURL(phoneTelUrl(order.phone))}>
          <Text style={styles.link}>{formatPhoneDisplay(order.phone)}</Text>
        </Pressable>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Adres</Text>
        <Text style={styles.value}>{order.address}</Text>
        <Pressable
          onPress={() =>
            void Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`,
            )
          }
        >
          <Text style={[styles.link, styles.small]}>Haritada aç</Text>
        </Pressable>
      </View>
      <Field label="Ödeme" value={PAYMENT_METHOD_LABELS[order.payment_method]} />
      {order.note ? (
        <View style={styles.field}>
          <Text style={styles.label}>Not</Text>
          <Text style={[styles.value, styles.note]}>{order.note}</Text>
        </View>
      ) : null}

      <View style={styles.items}>
        <Text style={styles.itemsTitle}>ÜRÜNLER</Text>
        {order.items.map((item, i) => {
          // Sunucu ürün adına seçenekleri zaten ekliyor: "Beyran (Acılı, Az sarımsaklı)"
          const mods = item.name.includes("(") ? null : formatModifiers(item);
          return (
            <View key={`${order.id}-${i}`} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.value}>
                  <Text style={styles.qty}>{item.quantity}× </Text>
                  {item.name}
                </Text>
                {mods ? <Text style={styles.mods}>{mods}</Text> : null}
              </View>
              <Text style={styles.price}>{formatTry(item.lineTotal)}</Text>
            </View>
          );
        })}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Toplam</Text>
          <Text style={styles.totalValue}>{formatTry(order.total)}</Text>
        </View>
      </View>

      {transitions.length > 0 ? (
        <View style={styles.actions}>
          {transitions.map((status) => {
            const cancel = status === "cancelled";
            return (
              <Pressable
                key={status}
                disabled={busy}
                onPress={() => onChangeStatus(order, status)}
                style={({ pressed }) => [
                  styles.action,
                  cancel ? styles.actionOutline : styles.actionPrimary,
                  (pressed || busy) && { opacity: 0.6 },
                ]}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.actionText,
                    { color: cancel ? colors.foreground : colors.accentForeground },
                  ]}
                >
                  {ORDER_STATUS_LABELS[status]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function Field({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, strong && { fontWeight: "600" }]}>{value}</Text>
    </View>
  );
}

export const OrderCard = memo(OrderCardBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },
  highlighted: { borderColor: colors.gold, borderWidth: 2 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 8 },
  number: { color: colors.goldLight, fontSize: 20, fontWeight: "700" },
  time: { color: colors.muted, fontSize: 13, marginTop: 2 },
  badge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  field: { marginTop: 10 },
  label: { color: colors.muted, fontSize: 13 },
  value: { color: colors.foreground, fontSize: 15, lineHeight: 21 },
  link: { color: colors.accentSoft, fontSize: 15, fontWeight: "600", marginTop: 1 },
  small: { fontSize: 13, marginTop: 4 },
  note: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
  },
  items: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  itemsTitle: { color: colors.gold, fontSize: 11, fontWeight: "700", letterSpacing: 2, marginBottom: 6 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 3 },
  qty: { fontWeight: "700" },
  mods: { color: colors.accentSoft, fontSize: 13, marginTop: 1 },
  price: { color: colors.goldLight, fontVariant: ["tabular-nums"], fontSize: 15 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  totalLabel: { color: colors.foreground, fontSize: 16, fontWeight: "700" },
  totalValue: { color: colors.goldLight, fontSize: 16, fontWeight: "700", fontVariant: ["tabular-nums"] },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  action: {
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  actionPrimary: { backgroundColor: colors.accent },
  actionOutline: { borderWidth: 1, borderColor: colors.borderStrong },
  actionText: { fontWeight: "700", fontSize: 15 },
});
