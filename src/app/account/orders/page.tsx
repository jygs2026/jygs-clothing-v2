"use client";

import Link from "next/link";

import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { MOCK_ORDERS, type AccountOrder } from "@/lib/account-data";
import { useAuthStore } from "@/lib/auth-store";
import { productForLine } from "@/lib/cart-store";
import { formatMoney } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Everything the customer has had from us. Orders are read-only here — the
 * studio answers questions by email, so each order links back to the pieces
 * in it rather than opening a support console nobody staffs.
 */
export default function OrdersPage() {
  const account = useAuthStore((s) => s.account)!;
  const orders = MOCK_ORDERS;

  return (
    <div>
      <h1 className="font-heading text-[32px] leading-[1.1] font-normal sm:text-[38px]">
        {account.name.split(" ")[0]}&rsquo;s orders
      </h1>
      <p className="mt-2.5 max-w-[52ch] text-[14.5px] leading-[24px] text-foreground/68">
        Everything you have had from us, and where each piece has got to.
        Repairs are free for as long as you own them — reply to any order email
        and we will send a returns label.
      </p>

      {orders.length ? (
        <div className="mt-9 flex flex-col divide-y divide-border/60">
          {orders.map((order) => (
            <OrderRow key={order.no} order={order} />
          ))}
        </div>
      ) : (
        <EmptyOrders />
      )}
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="mt-9 rounded-[3px] border border-border bg-card/45 p-8 text-center">
      <p className="font-heading text-[19px]">Nothing on its way yet</p>
      <p className="mx-auto mt-2 max-w-[38ch] text-[13.5px] leading-[22px] text-foreground/60">
        Volume 01 is a short run — three hundred pieces, then the pattern
        rests. Anything you order shows up here the moment it is cut.
      </p>
      <Button
        render={<Link href="/#collection" />}
        nativeButton={false}
        variant="outline"
        className="mt-6 h-10 px-6 text-[13px] tracking-[0.05em]"
      >
        See the collection
      </Button>
    </div>
  );
}

function OrderRow({ order }: { order: AccountOrder }) {
  const delivered = order.status === "Delivered";

  return (
    <article className="py-6 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
        <h2 className="text-[11px] tracking-[0.11em] text-foreground/50 uppercase font-feature-tnum">
          {order.no} · {order.placed}
        </h2>
        <span className="text-[13px] text-foreground/78 font-feature-tnum">
          {formatMoney(order.total)}
        </span>
      </div>

      <p
        className={cn(
          "mt-2 inline-flex items-center gap-2 text-[11px] tracking-[0.09em] uppercase",
          delivered ? "text-foreground/55" : "text-accent-2"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 rounded-full",
            delivered ? "bg-foreground/35" : "bg-accent"
          )}
        />
        {order.status}
      </p>
      <p className="mt-1 text-[13px] leading-[21px] text-foreground/60">{order.note}</p>

      <div className="mt-4 flex flex-col gap-3.5">
        {order.lines.map((line) => {
          const product = productForLine(line.productId);
          return (
            <div key={line.productId + line.size} className="flex items-center gap-3.5">
              <Link
                href={`/product/${line.productId}`}
                className="relative aspect-3/4 w-12 shrink-0 overflow-hidden"
              >
                <ProductImage
                  src={product?.image}
                  alt={product?.name ?? line.productId}
                  hint={product?.name ?? line.productId}
                />
              </Link>
              <div className="min-w-0">
                <Link
                  href={`/product/${line.productId}`}
                  className="block truncate font-heading text-[15px] leading-tight transition-colors hover:text-accent-2"
                >
                  {product?.name ?? line.productId}
                </Link>
                <p className="mt-1 text-[11px] tracking-[0.06em] text-foreground/55 uppercase">
                  {line.color} · {line.size} · Qty {line.qty}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
