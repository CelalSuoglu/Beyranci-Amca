import { z } from "zod";
import { MIN_ORDER_TOTAL_TL, ORDER_STATUSES, PAYMENT_METHODS } from "./constants";
import { getOrderableProduct } from "./orderable-menu";
import { normalizeTurkishPhone } from "./format";
import {
  SPICE_LEVELS,
  SPICE_LEVEL_LABELS,
  type SpiceLevel,
} from "./spice";

export const cartItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  spiceLevel: z.enum(SPICE_LEVELS).optional(),
});

export const createOrderInputSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(3, "Ad soyad en az 3 karakter olmalı.")
    .max(120, "Ad soyad çok uzun."),
  phone: z
    .string()
    .trim()
    .min(10, "Geçerli bir telefon numarası girin.")
    .max(20),
  address: z
    .string()
    .trim()
    .min(10, "Teslimat adresi en az 10 karakter olmalı.")
    .max(500, "Adres çok uzun."),
  note: z
    .string()
    .trim()
    .max(500, "Not en fazla 500 karakter olabilir.")
    .optional()
    .or(z.literal("")),
  paymentMethod: z.enum(PAYMENT_METHODS),
  items: z
    .array(cartItemInputSchema)
    .min(1, "Sepetiniz boş. En az bir ürün ekleyin."),
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export type ValidatedOrderLine = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  spiceLevel: SpiceLevel | null;
};

export type ValidatedOrder = {
  customerName: string;
  phone: string;
  address: string;
  note: string | null;
  paymentMethod: (typeof PAYMENT_METHODS)[number];
  items: ValidatedOrderLine[];
  subtotal: number;
  total: number;
};

/**
 * İstemci fiyatlarına güvenmez; ürün kimliği ve adetle sunucu fiyatını hesaplar.
 */
export function validateAndPriceOrder(
  input: CreateOrderInput,
):
  | { ok: true; order: ValidatedOrder }
  | { ok: false; message: string } {
  const phone = normalizeTurkishPhone(input.phone);
  if (!phone) {
    return {
      ok: false,
      message: "Geçerli bir Türkiye cep telefonu girin (örn. 05XX XXX XX XX).",
    };
  }

  const lines: ValidatedOrderLine[] = [];
  const seen = new Set<string>();

  for (const item of input.items) {
    const product = getOrderableProduct(item.productId);
    if (!product) {
      return {
        ok: false,
        message:
          "Sepette geçersiz bir ürün var. Sayfayı yenileyip tekrar deneyin.",
      };
    }

    let spiceLevel: SpiceLevel | null = null;
    if (product.requiresSpice) {
      if (!item.spiceLevel) {
        return {
          ok: false,
          message: `${product.name} için acı seçeneği zorunludur (Acılı / Az acılı / Acısız).`,
        };
      }
      spiceLevel = item.spiceLevel;
    } else if (item.spiceLevel) {
      return {
        ok: false,
        message: `${product.name} için acı seçeneği geçerli değil.`,
      };
    }

    const lineKey = spiceLevel
      ? `${item.productId}__${spiceLevel}`
      : item.productId;
    if (seen.has(lineKey)) {
      return {
        ok: false,
        message: "Sepette aynı ürün ve acı seçeneği birden fazla kez gönderilemez.",
      };
    }
    seen.add(lineKey);

    const displayName = spiceLevel
      ? `${product.name} (${SPICE_LEVEL_LABELS[spiceLevel]})`
      : product.name;

    const lineTotal =
      Math.round(product.unitPrice * item.quantity * 100) / 100;

    lines.push({
      productId: product.id,
      name: displayName,
      unitPrice: product.unitPrice,
      quantity: item.quantity,
      lineTotal,
      spiceLevel,
    });
  }

  const subtotal =
    Math.round(lines.reduce((sum, line) => sum + line.lineTotal, 0) * 100) /
    100;
  const total = subtotal;

  if (total < MIN_ORDER_TOTAL_TL) {
    return {
      ok: false,
      message: `Minimum sipariş tutarı ${MIN_ORDER_TOTAL_TL.toLocaleString("tr-TR")} TL’dir.`,
    };
  }

  const note = input.note?.trim() ? input.note.trim() : null;

  return {
    ok: true,
    order: {
      customerName: input.customerName.trim(),
      phone,
      address: input.address.trim(),
      note,
      paymentMethod: input.paymentMethod,
      items: lines,
      subtotal,
      total,
    },
  };
}
