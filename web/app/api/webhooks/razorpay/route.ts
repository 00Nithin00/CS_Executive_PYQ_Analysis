// Razorpay webhook endpoint. Configure in the Razorpay dashboard with the same secret as RAZORPAY_WEBHOOK_SECRET and the
// events: subscription.*, payment.failed, refund.created, refund.processed.
import { readBillingConfig } from "@/lib/billing/config";
import { razorpayApi } from "@/lib/billing/razorpay";
import { handleRazorpayWebhook } from "@/lib/billing/webhook";
import { store } from "@/lib/store";

export async function POST(request: Request) {
  const cfg = readBillingConfig();
  if (!cfg) return Response.json({ error: "billing not configured" }, { status: 503 });
  const result = await handleRazorpayWebhook(
    {
      rawBody: await request.text(),
      signature: request.headers.get("x-razorpay-signature"),
      eventId: request.headers.get("x-razorpay-event-id"),
    },
    { store, api: razorpayApi(cfg.keyId, cfg.keySecret), webhookSecret: cfg.webhookSecret },
  );
  return Response.json({ outcome: result.outcome.startsWith("error:") ? "error" : result.outcome }, { status: result.status });
}
