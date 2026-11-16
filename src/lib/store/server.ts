import { createClient } from "@supabase/supabase-js";
import { DEFAULT_STORE_SETTINGS, normalizeStoreSettings, type StoreSettings } from "./hours";

/** Mağaza ayarlarını okur (herkese açık tablo). Okunamazsa varsayılanlar: site kapanmaz. */
export async function getStoreSettings(): Promise<StoreSettings> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return DEFAULT_STORE_SETTINGS;
  try {
    const { data, error } = await createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return DEFAULT_STORE_SETTINGS;
    return normalizeStoreSettings(data as Record<string, unknown>);
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}
