import Link from "next/link";
import { ProductLogo } from "@/components/brand/product-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div aria-hidden className="paper-rule pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      <header className="relative mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <ProductLogo />
        <Link href="/" className="text-sm text-ink-3 hover:text-ink">
          Back to site
        </Link>
      </header>
      <main id="main" className="relative flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:items-center sm:pt-0">
        {children}
      </main>
    </div>
  );
}
