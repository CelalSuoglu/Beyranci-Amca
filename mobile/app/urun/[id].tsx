import { useState } from "react";
import { Image, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useCart } from "../../src/context/CartContext";
import { Button, Card, Chip, Message, Screen } from "../../src/components/ui";
import { defaultSpice } from "../../src/lib/catalog";
import {
  GARLIC_LEVEL_LABELS,
  SPICE_LEVEL_LABELS,
  formatTry,
  type GarlicLevel,
  type SpiceLevel,
} from "../../src/lib/orders";
import { colors } from "../../src/theme";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { productById, add } = useCart();
  const product = id ? productById(id) : undefined;
  const [qty, setQty] = useState(1);
  const [spice, setSpice] = useState<SpiceLevel | null>(product?.spiceLevels ? defaultSpice(product.spiceLevels) : null);
  const [garlic, setGarlic] = useState<GarlicLevel | null>(product?.requiresGarlic ? "az_sarimsakli" : null);

  if (!product) {
    return (
      <Screen edges={["left", "right", "bottom"]}>
        <Message>Bu ürün artık siparişe açık değil.</Message>
        <Button label="Menüye dön" variant="outline" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen edges={["left", "right", "bottom"]}>
      {product.imageUrl ? (
        <Image
          source={{ uri: product.imageUrl }}
          style={{ width: "100%", aspectRatio: 16 / 10, borderRadius: 16, marginBottom: 16, backgroundColor: colors.surfaceElevated }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : null}
      <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "700" }}>{product.name}</Text>
      <Text style={{ color: colors.goldLight, fontSize: 18, fontWeight: "700", marginTop: 6 }}>
        {formatTry(product.unitPrice)}
        {product.calories ? <Text style={{ color: colors.muted, fontSize: 14, fontWeight: "400" }}>  ·  {product.calories} kcal</Text> : null}
      </Text>
      {product.description ? <Text style={{ color: colors.muted, marginTop: 10, lineHeight: 21 }}>{product.description}</Text> : null}

      {product.spiceLevels ? (
        <Card style={{ marginTop: 18 }}>
          <Text style={label}>ACI SEÇENEĞİ</Text>
          <View style={rowWrap} accessibilityRole="radiogroup">
            {product.spiceLevels.map((l) => (
              <Chip key={l} label={SPICE_LEVEL_LABELS[l]} selected={spice === l} onPress={() => setSpice(l)} />
            ))}
          </View>
        </Card>
      ) : null}

      {product.requiresGarlic ? (
        <Card>
          <Text style={label}>SARIMSAK SEÇENEĞİ</Text>
          <View style={rowWrap} accessibilityRole="radiogroup">
            {(["az_sarimsakli", "bol_sarimsakli"] as GarlicLevel[]).map((l) => (
              <Chip key={l} label={GARLIC_LEVEL_LABELS[l]} selected={garlic === l} onPress={() => setGarlic(l)} />
            ))}
          </View>
        </Card>
      ) : null}

      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 18, marginBottom: 18 }}>
        <Button label="−" variant="outline" onPress={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 54 }} />
        <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "700", minWidth: 30, textAlign: "center" }} accessibilityLabel={`Adet ${qty}`}>
          {qty}
        </Text>
        <Button label="+" variant="outline" onPress={() => setQty((q) => Math.min(99, q + 1))} style={{ width: 54 }} />
      </View>

      <Button
        label={`Sepete ekle · ${formatTry(product.unitPrice * qty)}`}
        onPress={() => {
          add(product.id, qty, spice, garlic);
          router.back();
        }}
      />
    </Screen>
  );
}

const label = { color: colors.gold, fontSize: 11, fontWeight: "700" as const, letterSpacing: 2, marginBottom: 10 };
const rowWrap = { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 8 };
