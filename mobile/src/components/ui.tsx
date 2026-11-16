import type { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { colors } from "../theme";

/** Güvenli alan + klavye ile kaymayan kaydırılabilir ekran */
export function Screen({
  children,
  scroll = true,
  edges = ["top", "left", "right"],
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, contentStyle]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.inner}>{children}</View>
          </ScrollView>
        ) : (
          <View style={[styles.flex, contentStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Title({ children, eyebrow }: { children: ReactNode; eyebrow?: string }) {
  return (
    <View style={{ marginBottom: 16 }}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title} accessibilityRole="header">
        {children}
      </Text>
    </View>
  );
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <Text style={[styles.muted, style as object]}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonVariant = "primary" | "outline" | "danger" | "ghost";

export function Button({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: loading }}
      style={({ pressed }) => [
        styles.btn,
        variant === "primary" && styles.btnPrimary,
        variant === "outline" && styles.btnOutline,
        variant === "danger" && styles.btnDanger,
        variant === "ghost" && styles.btnGhost,
        (pressed || off) && { opacity: off ? 0.5 : 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.accentForeground : colors.foreground} />
      ) : (
        <Text
          style={[
            styles.btnText,
            { color: variant === "primary" ? colors.accentForeground : variant === "danger" ? colors.danger : colors.foreground },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function Input({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        {...props}
        style={[styles.input, props.multiline && { minHeight: 84, textAlignVertical: "top" }, props.style]}
      />
      {hint ? <Text style={[styles.muted, { fontSize: 12, marginTop: 4 }]}>{hint}</Text> : null}
    </View>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.chipOn]}
    >
      <Text style={[styles.chipText, selected && { color: colors.goldPale }]}>{label}</Text>
    </Pressable>
  );
}

export function Message({ tone = "error", children }: { tone?: "error" | "success" | "info"; children: ReactNode }) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.msg,
        tone === "error" && { borderColor: "rgba(239,68,68,0.35)", backgroundColor: colors.dangerBg },
        tone === "success" && { borderColor: "rgba(16,185,129,0.35)", backgroundColor: "rgba(6,78,59,0.4)" },
        tone === "info" && { borderColor: "rgba(212,175,55,0.4)", backgroundColor: "rgba(212,175,55,0.12)" },
      ]}
    >
      <Text style={{ color: tone === "error" ? colors.danger : tone === "success" ? "#a7f3d0" : colors.goldPale, lineHeight: 20 }}>
        {children}
      </Text>
    </View>
  );
}

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.gold} size="large" />
    </View>
  );
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 48, alignItems: "center" },
  inner: { width: "100%", maxWidth: 720 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "700", letterSpacing: 2.5, textTransform: "uppercase" },
  title: { color: colors.foreground, fontSize: 26, fontWeight: "700", marginTop: 2 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 12 },
  btn: { minHeight: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  btnPrimary: { backgroundColor: colors.accent },
  btnOutline: { borderWidth: 1, borderColor: colors.borderStrong },
  btnDanger: { borderWidth: 1, borderColor: "rgba(239,68,68,0.5)" },
  btnGhost: {},
  btnText: { fontWeight: "700", fontSize: 16 },
  label: { color: colors.foreground, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.foreground,
    fontSize: 16,
  },
  chip: { minHeight: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, justifyContent: "center" },
  chipOn: { borderColor: "rgba(212,175,55,0.55)", backgroundColor: "rgba(212,175,55,0.15)" },
  chipText: { color: colors.muted, fontWeight: "600" },
  msg: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
});
