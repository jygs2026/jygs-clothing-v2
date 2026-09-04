import type { Metadata } from "next";

import { ProductDetail } from "@/components/admin/products/product-detail";

export const metadata: Metadata = { title: "Product" };

export default function ProductPage() {
  return <ProductDetail />;
}
