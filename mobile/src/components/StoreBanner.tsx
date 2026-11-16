import { Text, View } from "react-native";
import type { StoreSettings, StoreStatus } from "../lib/storeHours";
import { colors } from "../theme";

/** Sipariş açık/kapalı + tahmini süre + duyuru */
export function StoreBanner({ settings, status }: { settings: StoreSettings; status: StoreStatus }) {
  return (
    <View style={{ gap: 8, marginBottom: 12 }}>
      <View
        accessibilityLiveRegion="polite"
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
          borderColor: status.open ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.45)",
          backgroundColor: status.open ? "rgba(6,78,59,0.35)" : colors.dangerBg,
        }}
      >
        {status.open ? (
          <Text style={{ color: "#d1fae5", lineHeight: 20 }}>
            <Text style={{ fontWeight: "700" }}>Siparişler açık. </Text>
            Tahmini teslimat {settings.eta_min}–{settings.eta_max} dk
            {status.lastOrderAt ? ` · Son sipariş ${status.lastOrderAt}` : ""}
          </Text>
        ) : (
          <Text style={{ color: colors.danger, lineHeight: 20 }}>
            <Text style={{ fontWeight: "700" }}>Şu an sipariş alınmıyor. </Text>
            {status.message}
          </Text>
        )}
      </View>
      {settings.announcement ? (
        <View style={{ borderWidth: 1, borderRadius: 12, padding: 12, borderColor: "rgba(212,175,55,0.4)", backgroundColor: "rgba(212,175,55,0.12)" }}>
          <Text style={{ color: colors.goldPale, lineHeight: 20 }}>{settings.announcement}</Text>
        </View>
      ) : null}
    </View>
  );
}
