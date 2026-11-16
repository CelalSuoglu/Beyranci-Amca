import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { useCart } from "../../src/context/CartContext";
import { colors } from "../../src/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
const icon = (name: IconName) => ({ color, size }: { color: string; size: number }) => (
  <Ionicons name={name} color={color} size={size} />
);

export default function TabsLayout() {
  const { isStaff } = useAuth();
  const { count } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Menü", tabBarIcon: icon("restaurant-outline") }} />
      <Tabs.Screen
        name="sepet"
        options={{
          title: "Sepet",
          tabBarIcon: icon("bag-handle-outline"),
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.gold, color: colors.accentForeground },
        }}
      />
      <Tabs.Screen name="siparislerim" options={{ title: "Siparişlerim", tabBarIcon: icon("receipt-outline") }} />
      {/* Personel sekmesi: yalnızca personel/yönetici hesabında görünür. Veri yetkisi sunucuda (RLS). */}
      <Tabs.Screen
        name="panel"
        options={{ title: "Panel", tabBarIcon: icon("flame-outline"), href: isStaff ? undefined : null }}
      />
      <Tabs.Screen name="profil" options={{ title: "Hesabım", tabBarIcon: icon("person-circle-outline") }} />
    </Tabs>
  );
}
