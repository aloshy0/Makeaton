"use client";

import React, { useState } from "react";
import { SmoothScrollProvider } from "../components/landing/SmoothScrollProvider";
import { Navbar } from "../components/landing/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { CustomerSubscriptionsSection } from "../components/landing/CustomerSubscriptionsSection";
import { AutomatedBillingSection } from "../components/landing/AutomatedBillingSection";
import { BusinessAnalyticsSection } from "../components/landing/BusinessAnalyticsSection";
import { FinalCtaFooterSection } from "../components/landing/FinalCtaFooterSection";

export default function FlowGridLandingPage() {
  const [mode, setMode] = useState<"personal" | "business">("business");

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-white text-[#101010] antialiased selection:bg-black selection:text-white overflow-x-hidden font-sans">
        {/* Sticky Minimal Navbar */}
        <Navbar mode={mode} setMode={setMode} />

        {/* Master Coordinated 7-Section Homepage Workflow */}
        <main className="w-full relative flex flex-col">
          {/* Section 1, 2 & 3: Hero, Product Management, Subscription Plans */}
          <HeroSection mode={mode} setMode={setMode} />

          {/* Section 4: Customer Subscriptions */}
          <CustomerSubscriptionsSection />

          {/* Section 5: Automated Billing */}
          <AutomatedBillingSection />

          {/* Section 6: Business Analytics */}
          <BusinessAnalyticsSection />

          {/* Section 7: Final Call to Action and Footer */}
          <FinalCtaFooterSection />
        </main>
      </div>
    </SmoothScrollProvider>
  );
}
