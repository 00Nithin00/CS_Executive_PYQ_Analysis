// Single source for plan presentation. The Pro amount comes from lib/config/pro-price.ts.
import { PRO_PRICE, PRO_PRODUCT } from "@/lib/config/pro-price";
import type { Capability } from "@/lib/entitlements/capabilities";
import type { PlanId } from "@/lib/entitlements/plans";

export interface PlanPresentation {
  id: PlanId;
  name: string;
  price: { amount: number; currency: "INR"; period: "month" | "year" | "attempt"; per?: "user" } | null;
  /** False while checkout is not open: the price is shown, but nothing can be bought. */
  purchasable: boolean;
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
    purchasable: false,
    priceNote: "No card needed",
    summary: "Everything official, in one place — plus a clean way to browse previous questions.",
    highlights: ["OFFICIAL_RESOURCES", "BASIC_PYQ"],
    cta: { label: "Create a free account", href: "/signup" },
  },
  {
    id: "PRO",
    name: PRO_PRODUCT.name,
    price: { amount: PRO_PRICE.amountPaise / 100, currency: "INR", period: "month", per: "user" },
    purchasable: false,
    priceNote: "Not yet available to buy: checkout is not open and no payment is taken.",
    summary: "For CS Executive (Syllabus 2022) only; CA and CMA are not included. Topic, marks and priority analysis for Company Law & Practice from the six reviewed papers (other subjects as their datasets are reviewed), with tools to plan and track your preparation.",
    highlights: [
      "PYQ_ANALYTICS",
      "TOPIC_FREQUENCY",
      "MARKS_ANALYSIS",
      "PRIORITY_TOPICS",
      "ADVANCED_FILTERS",
      "STUDY_PLANNER",
      "PROGRESS_TRACKING",
      "BOOKMARKS",
    ],
    cta: { label: "Start with a free account", href: "/signup?plan=pro" },
  },
];
