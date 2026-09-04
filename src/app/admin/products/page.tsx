import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductsScreen } from "@/components/admin/products/products-screen";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsScreen />
    </Suspense>
  );
}
