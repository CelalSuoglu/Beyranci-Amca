import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "./supabase";

/** Uygulama açıkken gelen bildirim de görünsün */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let channelsReady = false;

export async function ensureChannels(): Promise<void> {
  if (Platform.OS !== "android" || channelsReady) return;
  await Notifications.setNotificationChannelAsync("orders", {
    name: "Yeni siparişler (personel)",
    importance: Notifications.AndroidImportance.MAX,
    sound: "alarm.wav",
    vibrationPattern: [0, 400, 200, 400, 200, 400],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
  await Notifications.setNotificationChannelAsync("default", {
    name: "Sipariş durumu",
    importance: Notifications.AndroidImportance.HIGH,
  });
  channelsReady = true;
}

export type PushStatus = "granted" | "denied" | "undetermined" | "unsupported";

export async function getPushStatus(): Promise<PushStatus> {
  if (!Device.isDevice) return "unsupported";
  const { status } = await Notifications.getPermissionsAsync();
  return status as PushStatus;
}

/**
 * Bildirim izni ister (yalnızca kullanıcı bir işlem yaptığında çağrılır, açılışta değil)
 * ve cihaz anahtarını giriş yapmış hesaba kaydeder.
 */
export async function registerForPush(opts: { prompt: boolean }): Promise<PushStatus> {
  try {
    if (!Device.isDevice) return "unsupported";
    await ensureChannels();

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted" && opts.prompt) {
      ({ status } = await Notifications.requestPermissionsAsync());
    }
    if (status !== "granted") return status as PushStatus;

    const projectId =
      (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId ||
      Constants.easConfig?.projectId;
    if (!projectId) {
      console.warn("[push] EAS projectId yok — `eas init` çalıştırın.");
      return "unsupported";
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      await supabase.rpc("register_push_token", {
        p_token: token,
        p_platform: Platform.OS === "ios" ? "ios" : "android",
      });
    }
    return "granted";
  } catch (err) {
    console.warn("[push] kayıt başarısız", err);
    return "unsupported";
  }
}

/** Çıkışta bu cihazın anahtarı hesaptan kaldırılır (başkasının bildirimleri gelmesin) */
export async function unregisterPush(): Promise<void> {
  try {
    if (!Device.isDevice) return;
    const projectId = (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId;
    if (!projectId) return;
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await supabase.from("push_tokens").delete().eq("token", token);
  } catch {
    // yok say
  }
}
