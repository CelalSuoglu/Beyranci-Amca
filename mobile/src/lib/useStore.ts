import { useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import { supabase } from "./supabase";
import {
  DEFAULT_STORE_SETTINGS,
  getStoreStatus,
  normalizeStoreSettings,
  type StoreSettings,
  type StoreStatus,
} from "./storeHours";

/** Mağaza ayarları + şu an sipariş açık mı (canlı) */
export function useStore(): { settings: StoreSettings; status: StoreStatus; loaded: boolean; reload: () => Promise<void> } {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [clock, setClock] = useState(() => Date.now());

  const reload = async () => {
    const { data } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
    if (data) setSettings(normalizeStoreSettings(data as Record<string, unknown>));
    setLoaded(true);
  };

  useEffect(() => {
    void reload();
    const ch = supabase
      .channel(`store-settings-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "store_settings" }, () => void reload())
      .subscribe();
    const tick = setInterval(() => setClock(Date.now()), 30000);
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") {
        setClock(Date.now());
        void reload();
      }
    });
    return () => {
      clearInterval(tick);
      sub.remove();
      void supabase.removeChannel(ch);
    };
  }, []);

  const status = useMemo(() => getStoreStatus(settings, new Date(clock)), [settings, clock]);
  return { settings, status, loaded, reload };
}
