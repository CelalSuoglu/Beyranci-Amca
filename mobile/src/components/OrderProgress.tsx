import { StyleSheet, Text, View } from "react-native";
import { CUSTOMER_STEPS, ORDER_STATUS_LABELS, formatOrderTime, type OrderStatus } from "../lib/orders";
import { colors } from "../theme";

export type ProgressEvent = { to_status: OrderStatus; created_at: string };

export function StatusBadge({ status }: { status: OrderStatus }) {
  const tone =
    status === "cancelled"
      ? { bg: "rgba(239,68,68,0.2)", fg: "#fecaca" }
      : status === "completed"
        ? { bg: "rgba(16,185,129,0.2)", fg: "#a7f3d0" }
        : status === "new"
          ? { bg: "rgba(249,115,22,0.2)", fg: "#fed7aa" }
          : { bg: "rgba(212,175,55,0.15)", fg: colors.goldPale };
  return (
    <View style={[s.badge, { backgroundColor: tone.bg }]}>
      <Text style={[s.badgeText, { color: tone.fg }]}>{ORDER_STATUS_LABELS[status]}</Text>
    </View>
  );
}

export function OrderProgress({ status, events }: { status: OrderStatus; events: ProgressEvent[] }) {
  if (status === "cancelled") {
    return (
      <Text style={{ color: colors.danger, lineHeight: 20 }}>
        Bu sipariş iptal edildi. Sorunuz varsa restoranı arayabilirsiniz.
      </Text>
    );
  }
  const reached = new Map(events.map((e) => [e.to_status, e.created_at]));
  const current = Math.max(0, CUSTOMER_STEPS.findIndex((st) => st.status === status));
  return (
    <View accessibilityLabel={`Sipariş durumu: ${ORDER_STATUS_LABELS[status]}`}>
      {CUSTOMER_STEPS.map((step, i) => {
        const done = i <= current;
        const at = reached.get(step.status);
        const skipped = done && i !== current && !at && step.status !== "new";
        const lit = done && !skipped;
        return (
          <View key={step.status} style={s.step}>
            <View style={s.rail}>
              <View style={[s.dot, lit && s.dotOn, i === current && s.dotCurrent]}>
                <Text style={[s.dotText, lit && { color: colors.accentForeground }]}>{lit ? "✓" : i + 1}</Text>
              </View>
              {i < CUSTOMER_STEPS.length - 1 ? <View style={[s.line, i < current && { backgroundColor: "rgba(212,175,55,0.6)" }]} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: 16 }}>
              <Text style={[s.stepLabel, !lit && { color: colors.muted }]}>{step.label}</Text>
              {at ? <Text style={s.stepTime}>{formatOrderTime(at)}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  badge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start" },
  badgeText: { fontSize: 12, fontWeight: "700" },
  step: { flexDirection: "row", gap: 12 },
  rail: { alignItems: "center", width: 26 },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  dotOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  dotCurrent: { shadowColor: colors.gold, shadowOpacity: 0.6, shadowRadius: 6, elevation: 4 },
  dotText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  line: { flex: 1, width: 1, backgroundColor: "rgba(255,255,255,0.1)", minHeight: 18 },
  stepLabel: { color: colors.foreground, fontWeight: "600", fontSize: 15, marginTop: 3 },
  stepTime: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
