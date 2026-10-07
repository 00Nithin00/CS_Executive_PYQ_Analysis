import Link from "next/link";
import { SITE } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";
import { ProductMark, type MarkVariant } from "./product-mark";

/**
 * Logo lockups. The wordmark text always comes from SITE (lib/config/site.ts), so renaming the
 * product never touches the symbol.
 *  - "nav":        compact — mark + name + small descriptor (header, sidebar, auth pages)
 *  - "horizontal": mark + name + descriptor at a larger size (footer, marketing)
 *  - "mark":       symbol only
 */
export function ProductLogo({
  variant = "nav",
  markVariant = "color",
  href = "/",
  className,
}: {
  variant?: "nav" | "horizontal" | "mark";
  markVariant?: MarkVariant;
  href?: string | null;
  className?: string;
}) {
  const big = variant === "horizontal";
  const content =
    variant === "mark" ? (
      <ProductMark size={28} variant={markVariant} title={SITE.name} />
    ) : (
      <>
        <ProductMark size={big ? 34 : 26} variant={markVariant} />
        <span className="flex flex-col leading-none">
          <span className={cn("font-display font-semibold tracking-tight text-ink", big ? "text-[1.3rem]" : "text-[1.05rem]")}>{SITE.name}</span>
          <span className={cn("mt-1 font-medium tracking-wide text-ink-3", big ? "text-xs" : "text-[0.6875rem]")}>{SITE.descriptor}</span>
        </span>
      </>
    );
  const cls = cn("inline-flex items-center rounded-md", big ? "gap-3" : "gap-2.5", className);
  if (!href) return <span className={cls}>{content}</span>;
  return (
    <Link href={href} className={cls} aria-label={`${SITE.name} home`}>
      {content}
    </Link>
  );
}
