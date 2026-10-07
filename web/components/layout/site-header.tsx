import { Suspense } from "react";
import { ProductLogo } from "@/components/brand/product-logo";
import { AuthNav, AuthNavFallback } from "./auth-nav";
import { DesktopNav } from "./desktop-nav";
import { MobileMenu } from "./mobile-menu";

// No backdrop-filter on the header: it makes the header the containing block for position:fixed
// descendants, which collapsed the mobile menu panel to 0px height (WebKit and Chromium).
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/95">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <ProductLogo />
        <DesktopNav />
        <div className="hidden lg:block">
          <Suspense fallback={<AuthNavFallback />}>
            <AuthNav />
          </Suspense>
        </div>
        <MobileMenu
          authSlot={
            <Suspense fallback={<AuthNavFallback variant="mobile" />}>
              <AuthNav variant="mobile" />
            </Suspense>
          }
        />
      </div>
    </header>
  );
}
