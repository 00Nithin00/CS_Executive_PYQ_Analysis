"use client";

import { useActionState } from "react";
import { grantProAction, revokeProAction, type AdminActionState } from "@/lib/actions/personal";
import { cn } from "@/lib/utils/cn";

const IDLE: AdminActionState = { status: "idle", message: "" };

export function AdminUserActions({ userId, isPro, email }: { userId: string; isPro: boolean; email: string }) {
  const [state, action, pending] = useActionState(isPro ? revokeProAction : grantProAction, IDLE);
  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <form action={action}>
        <input type="hidden" name="userId" value={userId} />
        <button
          disabled={pending}
          aria-label={`${isPro ? "Revoke admin-granted Pro for" : "Grant Pro to"} ${email}`}
          className="h-9 rounded-full border border-line px-4 text-sm font-medium hover:bg-surface-2 disabled:opacity-50"
        >
          {pending ? "Working…" : isPro ? "Revoke admin grant" : "Grant Pro"}
        </button>
      </form>
      <p aria-live="polite" className={cn("text-xs", state.status === "error" ? "text-danger-600" : "text-accent-700")}>
        {state.message}
      </p>
    </div>
  );
}
