"use client";

import React, { useState } from "react";
import { SmoothScrollProvider } from "../components/landing/SmoothScrollProvider";
import { Navbar } from "../components/landing/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { ProductIntroSection } from "../components/landing/ProductIntroSection";
import { SubscriptionLifecycleSection } from "../components/landing/SubscriptionLifecycleSection";
import { BillingAutomationSection } from "../components/landing/BillingAutomationSection";
import { ReliabilityBentoSection } from "../components/landing/ReliabilityBentoSection";
import { FeaturesGridSection } from "../components/landing/FeaturesGridSection";
import { PricingSection } from "../components/landing/PricingSection";
import { FooterSection } from "../components/landing/FooterSection";

export default function FlowGridLandingPage() {
  const [mode, setMode] = useState<"personal" | "business">("business");

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#f7f7f8] text-[#101010] antialiased selection:bg-black selection:text-white overflow-x-hidden font-sans">
        {/* Minimal Navigation with Flyouts */}
        <Navbar mode={mode} setMode={setMode} />

        {/* Main Landing Page Experience */}
        <main className="space-y-4 sm:space-y-8">
          {/* Section 1: Hero with Dark Obsidian Shell, Aurora Glow & Product Dashboard Preview */}
          <HeroSection mode={mode} setMode={setMode} />

          {/* Section 2: Product Introduction with Interactive Invoice Action Simulator */}
          <ProductIntroSection />

          {/* Section 3: Subscription Lifecycle Management with Real-Time Revenue Chart */}
          <SubscriptionLifecycleSection />

          {/* Section 4: Automated Billing Functions with Dark Shell */}
          <BillingAutomationSection />

          {/* Section 5: Enterprise Reliability & Infrastructure Bento Grid */}
          <ReliabilityBentoSection />

          {/* Section 6: Core Architecture & Features */}
          <FeaturesGridSection />

          {/* Section 7: Transparent Competitive Pricing with 4-Column Tier Matrix */}
          <PricingSection mode={mode} setMode={setMode} />
        </main>

        {/* Minimalist Rounded Footer Container */}
        <FooterSection mode={mode} setMode={setMode} />
      </div>
    </SmoothScrollProvider>
  );
}
