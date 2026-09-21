import type { OrderStatus, PaymentMethod } from "./constants";

export type OrderItemRecord = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrderRecord = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  note: string | null;
  payment_method: PaymentMethod;
  items: OrderItemRecord[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};
