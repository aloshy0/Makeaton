"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ProfessionalSidebar } from "./professional-sidebar";
import { Header } from "./header";
import { CustomerNavigation } from "./customer-navigation";
import { useAccount } from "../../context/account-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSidebarCollapsed } = useAccount();

  // 1. Public marketing landing page
  if (pathname === "/") {
    return <>{children}</>;
  }

  // 2. Standalone Auth & Checkout pages (no internal business sidebar)
  const isAuthOrCheckout =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password") ||
    pathname?.startsWith("/checkout");

  if (isAuthOrCheckout) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] text-[#0B1020] font-sans antialiased flex flex-col justify-center">
        {children}
      </div>
    );
  }

  // 3. Dedicated Workspace Selection screen (/workspaces) & Onboarding (/onboarding)
  if (pathname === "/workspaces" || pathname?.startsWith("/onboarding")) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] text-[#0B1020] font-sans antialiased">
        {children}
      </div>
    );
  }

  // 4. Personal Customer Application Shell (/portal/*)
  if (pathname?.startsWith("/portal")) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] text-[#0B1020] font-sans antialiased flex flex-col">
        <CustomerNavigation />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    );
  }

  // 5. Professional Business Application Shell (/dashboard, /catalog, /subscriptions, etc.)
  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans text-[#0B1020] antialiased">
      <ProfessionalSidebar />
      <div
        className={`${
          isSidebarCollapsed ? "md:pl-[68px]" : "md:pl-[245px]"
        } flex flex-col min-h-screen transition-all duration-300 ease-in-out`}
      >
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8 mt-14 md:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
