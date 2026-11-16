"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Item = {
  productId: string;
  quantity: number;
  spiceLevel?: string | null;
  garlicLevel?: string | null;
};

const CART_STORAGE_KEY = "beyranci:cart:v1";

/** Geçmiş siparişin ürünlerini sepete koyup sipariş sayfasını açar (fiyatlar güncel menüden) */
export function ReorderButton({ items }: { items: Item[] }) {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        const lines = items
          .filter((i) => i.productId && i.quantity > 0)
          .map((i) => ({
            key: [i.productId, i.spiceLevel ?? "", i.garlicLevel ?? ""].join("__"),
            productId: i.productId,
            quantity: Math.min(99, i.quantity),
            spiceLevel: i.spiceLevel ?? null,
            garlicLevel: i.garlicLevel ?? null,
          }));
        try {
          window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
        } catch {
          // depolama yoksa yine de sipariş sayfasına git
        }
        router.push("/siparis#siparis-musteri");
      }}
    >
      Tekrar sipariş ver
    </Button>
  );
}
