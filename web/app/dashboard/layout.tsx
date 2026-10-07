import type { Metadata } from "next";
import { DashboardMobileHeader, DashboardSidebar } from "@/components/dashboard/dashboard-chrome";
import { DashboardTabBar } from "@/components/dashboard/dashboard-nav";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Dashboard" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="flex min-h-dvh">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardMobileHeader />
        <main id="main" className="flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">
          <div className="mx-auto w-full max-w-[1100px]">{children}</div>
        </main>
      </div>
      <DashboardTabBar />
    </div>
  );
}
