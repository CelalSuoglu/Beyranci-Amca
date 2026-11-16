import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Button, Card, Input, Message, Muted, Screen } from "../src/components/ui";
import { MAX_DELIVERY_KM } from "../src/lib/orders";
import { supabase } from "../src/lib/supabase";
import { colors } from "../src/theme";

type Address = { id: string; label: string; address: string; is_default: boolean };

export default function AddressesScreen() {
  const [list, setList] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Address | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [label, setLabel] = useState("Ev");
  const [text, setText] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("addresses")
      .select("id, label, address, is_default")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    setList((data ?? []) as Address[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function open(a: Address | null) {
    setEditing(a);
    setLabel(a?.label ?? "Ev");
    setText(a?.address ?? "");
    setIsDefault(a?.is_default ?? list.length === 0);
    setError(null);
    setFormOpen(true);
  }

  async function save() {
    if (busy) return;
    if (!label.trim() || label.trim().length > 40) return setError("Adres adı 1–40 karakter olmalı.");
    if (text.trim().length < 10) return setError("Adres en az 10 karakter olmalı.");
    setBusy(true);
    setError(null);
    if (isDefault) await supabase.from("addresses").update({ is_default: false }).eq("is_default", true);
    const payload = { label: label.trim(), address: text.trim(), is_default: isDefault };
    const { error: err } = editing
      ? await supabase.from("addresses").update(payload).eq("id", editing.id)
      : await supabase.from("addresses").insert(payload);
    setBusy(false);
    if (err) return setError("Adres kaydedilemedi.");
    setFormOpen(false);
    await load();
  }

  function remove(a: Address) {
    Alert.alert("Adresi sil", `"${a.label}" silinsin mi?`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          await supabase.from("addresses").delete().eq("id", a.id);
          await load();
        },
      },
    ]);
  }

  return (
    <Screen edges={["left", "right", "bottom"]}>
      {list.length === 0 && !formOpen ? <Muted style={{ marginBottom: 14 }}>Kayıtlı adresiniz yok.</Muted> : null}
      {list.map((a) => (
        <Card key={a.id}>
          <Text style={{ color: colors.foreground, fontWeight: "700" }}>
            {a.label}
            {a.is_default ? <Text style={{ color: colors.goldPale, fontWeight: "500" }}>  · Varsayılan</Text> : null}
          </Text>
          <Text style={{ color: colors.muted, marginTop: 4, lineHeight: 20 }}>{a.address}</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <Button label="Düzenle" variant="outline" onPress={() => open(a)} style={{ flex: 1, minHeight: 42 }} />
            <Button label="Sil" variant="danger" onPress={() => remove(a)} style={{ flex: 1, minHeight: 42 }} />
          </View>
        </Card>
      ))}

      {formOpen ? (
        <Card>
          <Input label="Adres adı" value={label} onChangeText={setLabel} placeholder="Ev, İş…" />
          <Input label="Açık adres" value={text} onChangeText={setText} multiline placeholder="Mahalle, sokak, bina no, daire, ilçe" hint={`${MAX_DELIVERY_KM} km'ye kadar teslimat yapılır.`} />
          <Pressable onPress={() => setIsDefault((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: isDefault }} style={{ flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: isDefault ? colors.gold : colors.borderStrong, backgroundColor: isDefault ? colors.gold : "transparent" }} />
            <Text style={{ color: colors.foreground }}>Varsayılan adres</Text>
          </Pressable>
          {error ? <Message>{error}</Message> : null}
          <Button label="Kaydet" onPress={() => void save()} loading={busy} />
          <Button label="Vazgeç" variant="ghost" onPress={() => setFormOpen(false)} style={{ marginTop: 6 }} />
        </Card>
      ) : (
        <Button label="Yeni adres ekle" onPress={() => open(null)} />
      )}
    </Screen>
  );
}
