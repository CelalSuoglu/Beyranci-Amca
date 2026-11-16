import { useMemo, useRef, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, SectionList, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../../src/context/CartContext";
import { Button, Loading, Message } from "../../src/components/ui";
import { MIN_ORDER_TOTAL_TL, MAX_DELIVERY_KM, formatTry } from "../../src/lib/orders";
import { colors } from "../../src/theme";

export default function MenuScreen() {
  const { catalog, catalogLoading, catalogError, reloadCatalog, count, subtotal } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [active, setActive] = useState(0);
  const listRef = useRef<SectionList>(null);

  const sections = useMemo(() => catalog.map((c) => ({ key: c.key, title: c.title, data: c.products })), [catalog]);

  if (catalogLoading) return <Loading />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "left", "right"]}>
      <View style={s.header}>
        <Image source={require("../../assets/logo.png")} style={s.logo} resizeMode="contain" accessibilityLabel="Beyrancı Amca" />
        <View style={{ flex: 1 }}>
          <Text style={s.brand}>BEYRANCI AMCA</Text>
          <Text style={s.title}>Paket sipariş</Text>
          <Text style={s.sub}>
            Min. {formatTry(MIN_ORDER_TOTAL_TL)} · {MAX_DELIVERY_KM} km'ye kadar teslimat
          </Text>
        </View>
      </View>

      {sections.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs} style={{ flexGrow: 0 }}>
          {sections.map((sec, i) => (
            <Pressable
              key={sec.key}
              onPress={() => {
                setActive(i);
                listRef.current?.scrollToLocation({ sectionIndex: i, itemIndex: 0, viewOffset: 40, animated: true });
              }}
              style={[s.tab, active === i && s.tabOn]}
            >
              <Text style={[s.tabText, active === i && { color: colors.goldPale }]}>{sec.title.split("/")[0].trim()}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {catalogError ? (
        <View style={{ padding: 16 }}>
          <Message>{catalogError}</Message>
          <Button label="Tekrar dene" variant="outline" onPress={() => void reloadCatalog()} />
        </View>
      ) : null}

      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(p) => p.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ padding: 16, paddingBottom: count > 0 ? 110 : 32 }}
        onScrollToIndexFailed={() => undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.gold}
            onRefresh={async () => {
              setRefreshing(true);
              await reloadCatalog();
              setRefreshing(false);
            }}
          />
        }
        renderSectionHeader={({ section }) => <Text style={s.section}>{section.title}</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/urun/${item.id}`)}
            style={({ pressed }) => [s.item, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityHint="Ürün seçeneklerini açar"
          >
            <View style={{ flex: 1 }}>
              <Text style={s.itemName}>
                {item.name}
                {item.calories ? <Text style={s.kcal}>  {item.calories} kcal</Text> : null}
              </Text>
              {item.description ? (
                <Text style={s.itemDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              {item.spiceLevels || item.requiresGarlic ? <Text style={s.itemTag}>Seçenekli</Text> : null}
            </View>
            <View style={{ alignItems: "flex-end", gap: 8 }}>
              <Text style={s.price}>{formatTry(item.unitPrice)}</Text>
              <View style={s.plus}>
                <Text style={s.plusText}>+</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={!catalogError ? <Text style={{ color: colors.muted }}>Şu anda siparişe açık ürün yok.</Text> : null}
      />

      {count > 0 ? (
        <View style={s.cartBarWrap} pointerEvents="box-none">
          <Pressable style={s.cartBar} onPress={() => router.push("/sepet")} accessibilityRole="button">
            <Text style={s.cartBarText}>Sepete git · {count} ürün</Text>
            <Text style={s.cartBarTotal}>{formatTry(subtotal)}</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}


const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  logo: { width: 52, height: 58 },
  brand: { color: colors.gold, fontSize: 11, fontWeight: "700", letterSpacing: 2.5 },
  title: { color: colors.foreground, fontSize: 24, fontWeight: "700" },
  sub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  tabs: { gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  tab: { minHeight: 38, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, justifyContent: "center" },
  tabOn: { borderColor: "rgba(212,175,55,0.55)", backgroundColor: "rgba(212,175,55,0.15)" },
  tabText: { color: colors.muted, fontWeight: "600" },
  section: { color: "#faf6ef", fontSize: 19, fontWeight: "700", marginTop: 14, marginBottom: 10 },
  item: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  itemName: { color: colors.foreground, fontWeight: "600", fontSize: 16 },
  kcal: { color: colors.muted, fontSize: 12, fontWeight: "400" },
  itemDesc: { color: colors.muted, fontSize: 13, marginTop: 4, lineHeight: 18 },
  itemTag: { color: colors.accentSoft, fontSize: 12, marginTop: 6 },
  price: { color: colors.goldLight, fontWeight: "700", fontSize: 15 },
  plus: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: "rgba(212,175,55,0.5)", alignItems: "center", justifyContent: "center" },
  plusText: { color: colors.goldPale, fontSize: 20, lineHeight: 22 },
  cartBarWrap: { position: "absolute", left: 0, right: 0, bottom: 12, paddingHorizontal: 16 },
  cartBar: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  cartBarText: { color: colors.accentForeground, fontWeight: "700", fontSize: 16 },
  cartBarTotal: { color: colors.accentForeground, fontWeight: "800", fontSize: 16 },
});
