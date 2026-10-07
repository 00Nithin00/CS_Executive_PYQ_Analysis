// Single source for plan presentation. Prices are NOT final — keep `price: null` until decided.
import type { Capability } from "@/lib/entitlements/capabilities";
import type { PlanId } from "@/lib/entitlements/plans";

export interface PlanPresentation {
  id: PlanId;
  name: string;
  price: { amount: number; currency: "INR"; period: "month" | "year" | "attempt" } | null;
  priceNote: string;
  summary: string;
  highlights: Capability[];
  cta: { label: string; href: string };
}

export const PLAN_PRESENTATION: PlanPresentation[] = [
  {
    id: "FREE",
    name: "Free",
    price: { amount: 0, currency: "INR", period: "month" },
    priceNote: "No card needed",
    summary: "Everything official, in one place — plus a clean way to browse previous questions.",
    highlights: ["OFFICIAL_RESOURCES", "BASIC_PYQ"],
    cta: { label: "Create a free account", href: "/signup" },
  },
  {
    id: "PRO",
    name: "Pro",
    price: null,
    priceNote: "Pricing will be announced before launch",
    summary: "Historical PYQ intelligence for each subject as its dataset is verified, with tools to plan and track your preparation.",
    highlights: [
      "PYQ_ANALYTICS",
      "TOPIC_FREQUENCY",
      "MARKS_ANALYSIS",
      "REPEAT_ANALYSIS",
      "PRIORITY_TOPICS",
      "ADVANCED_FILTERS",
      "STUDY_PLANNER",
      "PROGRESS_TRACKING",
      "BOOKMARKS",
      "MOCK_TESTS",
      "AI_ASSISTANT",
    ],
    cta: { label: "Join the Pro waitlist", href: "/signup?plan=pro" },
  },
];
