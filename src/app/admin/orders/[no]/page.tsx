import type { Metadata } from "next";

import { OrderDetail } from "@/components/admin/orders/order-detail";

export const metadata: Metadata = { title: "Order" };

export default function OrderPage() {
  return <OrderDetail />;
}
