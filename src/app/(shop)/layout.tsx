import { CartSheet } from "@/components/cart-sheet";
import { SearchOverlay } from "@/components/search-overlay";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/** Everything a customer sees: the shop's header, footer, bag and search. */
export default function ShopLayout({ children }: LayoutProps<"/"> ) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartSheet />
      <SearchOverlay />
    </>
  );
}
