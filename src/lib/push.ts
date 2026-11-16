import { createAdminClient } from "@/lib/supabase/admin";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/orders/constants";
import { formatTry } from "@/lib/orders/format";

type PushMessage = {
  title: string;
  body: string;
  data: Record<string, string>;
  channelId: "orders" | "default";
  sound: "alarm.wav" | "default";
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Expo Push API ile bildirim gönderir. Hata olursa sipariş akışını bozmaz;
 * personel paneli zaten canlı bağlantı + periyodik yenileme ile çalışır.
 */
async function sendToTokens(tokens: string[], message: PushMessage): Promise<void> {
  const valid = tokens.filter((t) => /^Expo(nent)?PushToken\[.+\]$/.test(t));
  if (valid.length === 0) return;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (process.env.EXPO_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.EXPO_ACCESS_TOKEN}`;
  }

  const stale: string[] = [];
  for (let i = 0; i < valid.length; i += 100) {
    const chunk = valid.slice(i, i + 100);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(
          chunk.map((to) => ({
            to,
            title: message.title,
            body: message.body,
            data: message.data,
            sound: message.sound,
            channelId: message.channelId,
            priority: "high",
          })),
        ),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        console.error("[push] expo yanıtı", res.status);
        continue;
      }
      const json = (await res.json()) as {
        data?: { status: string; details?: { error?: string } }[];
      };
      json.data?.forEach((ticket, idx) => {
        if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
          stale.push(chunk[idx]);
        }
      });
    } catch (err) {
      console.error("[push] gönderilemedi", err instanceof Error ? err.name : "error");
    }
  }

  if (stale.length) {
    try {
      await createAdminClient().from("push_tokens").delete().in("token", stale);
    } catch {
      // yok say
    }
  }
}

async function tokensForUsers(userIds: string[]): Promise<string[]> {
  if (userIds.length === 0) return [];
  const { data } = await createAdminClient()
    .from("push_tokens")
    .select("token")
    .in("user_id", userIds);
  return (data ?? []).map((r) => r.token as string);
}

export async function notifyStaffNewOrder(order: {
  id: string;
  order_number: string;
  total: number;
  customer_name: string;
}): Promise<void> {
  try {
    const { data } = await createAdminClient()
      .from("profiles")
      .select("id")
      .in("role", ["staff", "admin"]);
    const tokens = await tokensForUsers((data ?? []).map((r) => r.id as string));
    await sendToTokens(tokens, {
      title: `Yeni sipariş: ${order.order_number}`,
      body: `${order.customer_name} · ${formatTry(order.total)}`,
      data: { type: "staff_order", orderId: order.id },
      channelId: "orders",
      sound: "alarm.wav",
    });
  } catch (err) {
    console.error("[push] personel bildirimi", err instanceof Error ? err.name : "error");
  }
}

const CUSTOMER_STATUS_TEXT: Partial<Record<OrderStatus, string>> = {
  accepted: "Siparişiniz onaylandı.",
  preparing: "Siparişiniz hazırlanıyor.",
  ready: "Siparişiniz hazır.",
  out_for_delivery: "Siparişiniz yola çıktı.",
  completed: "Siparişiniz teslim edildi. Afiyet olsun!",
  cancelled: "Siparişiniz iptal edildi. Sorunuz varsa bizi arayın.",
};

/** "2026-11-16T19:45:00Z" → "22:45" (Türkiye saati) */
function trClock(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 3 * 3600000);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

export async function notifyCustomerStatus(order: {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  eta_at?: string | null;
  cancel_reason?: string | null;
}): Promise<void> {
  if (!order.user_id) return;
  let body = CUSTOMER_STATUS_TEXT[order.status];
  if (!body) return;
  if (order.eta_at && (order.status === "accepted" || order.status === "preparing")) {
    body = `${body} Tahmini teslimat ${trClock(order.eta_at)}.`;
  }
  if (order.status === "cancelled" && order.cancel_reason) {
    body = `Siparişiniz iptal edildi: ${order.cancel_reason}`;
  }
  try {
    const tokens = await tokensForUsers([order.user_id]);
    await sendToTokens(tokens, {
      title: `${order.order_number} · ${ORDER_STATUS_LABELS[order.status]}`,
      body,
      data: { type: "customer_order", orderId: order.id },
      channelId: "default",
      sound: "default",
    });
  } catch (err) {
    console.error("[push] müşteri bildirimi", err instanceof Error ? err.name : "error");
  }
}

export async function notifyCustomerOrderReceived(order: {
  id: string;
  order_number: string;
  user_id: string | null;
}): Promise<void> {
  if (!order.user_id) return;
  try {
    const tokens = await tokensForUsers([order.user_id]);
    await sendToTokens(tokens, {
      title: `Siparişiniz alındı · ${order.order_number}`,
      body: "Mutfağa iletildi. Durumunu buradan takip edebilirsiniz.",
      data: { type: "customer_order", orderId: order.id },
      channelId: "default",
      sound: "default",
    });
  } catch {
    // yok say
  }
}
