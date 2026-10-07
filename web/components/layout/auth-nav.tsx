import { LayoutDashboard } from "lucide-react";
import { getViewer } from "@/lib/auth/viewer";
import { ButtonLink } from "@/components/ui/button";
import { ProBadge } from "@/components/ui/primitives";

/** Reads the session — always render inside <Suspense> (Cache Components). */
export async function AuthNav({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const viewer = await getViewer();
  const stacked = variant === "mobile";
  if (viewer.state === "anonymous") return <AuthNavFallback variant={variant} />;
  return (
    <div className={stacked ? "flex flex-col gap-2" : "flex items-center gap-2"}>
      {viewer.state === "pro" && !stacked && <ProBadge />}
      <ButtonLink href="/dashboard" size={stacked ? "lg" : "sm"} variant={stacked ? "primary" : "secondary"} className={stacked ? "w-full" : ""}>
        <LayoutDashboard aria-hidden className="size-4" /> Dashboard
      </ButtonLink>
      {viewer.state === "free" && (
        <ButtonLink href="/pricing" size={stacked ? "lg" : "sm"} variant="pro" className={stacked ? "w-full" : ""}>
          Get Pro
        </ButtonLink>
      )}
    </div>
  );
}

export function AuthNavFallback({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const stacked = variant === "mobile";
  return (
    <div className={stacked ? "flex flex-col gap-2" : "flex items-center gap-1.5"}>
      <ButtonLink href="/login" size={stacked ? "lg" : "sm"} variant={stacked ? "secondary" : "ghost"} className={stacked ? "w-full" : ""}>
        Log in
      </ButtonLink>
      <ButtonLink href="/signup" size={stacked ? "lg" : "sm"} className={stacked ? "w-full" : ""}>
        Get started
      </ButtonLink>
    </div>
  );
}
