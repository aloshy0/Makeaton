"use client";

import React, { useState } from "react";
import { SmoothScrollProvider } from "../components/landing/SmoothScrollProvider";
import { Navbar } from "../components/landing/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { WorkflowStorytellingSection } from "../components/landing/WorkflowStorytellingSection";
import { AutomatedBillingEngineSection } from "../components/landing/AutomatedBillingEngineSection";
import { AnalyticsDashboardSection } from "../components/landing/AnalyticsDashboardSection";
import { ReliabilityBentoSection } from "../components/landing/ReliabilityBentoSection";
import { FeaturesGridSection } from "../components/landing/FeaturesGridSection";
import { PricingSection } from "../components/landing/PricingSection";
import { FooterSection } from "../components/landing/FooterSection";

export default function FlowGridLandingPage() {
  const [mode, setMode] = useState<"personal" | "business">("business");

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#f7f7f8] text-[#101010] antialiased selection:bg-black selection:text-white overflow-x-hidden font-sans">
        {/* Sticky Minimal Navbar with Mega-Dropdowns */}
        <Navbar mode={mode} setMode={setMode} />

        {/* Master Coordinated Scroll Experience */}
        <main className="space-y-4 sm:space-y-8">
          {/* Section 1: Hero with line-by-line reveal, counting metrics, progressive donut draw, and floating dashboard */}
          <HeroSection mode={mode} setMode={setMode} />

          {/* Section 2: Pinned Full-Screen Storytelling Workflow (PRODUCTS → PLANS → SUBSCRIPTIONS → INVOICES → PAYMENTS) */}
          <WorkflowStorytellingSection />

          {/* Section 3: Automated Billing Engine with Animated Invoice Generation & Payment Stamp */}
          <AutomatedBillingEngineSection />

          {/* Section 4: Animated Financial Dashboard with Drawing Revenue Curve & Growing Bars */}
          <AnalyticsDashboardSection />

          {/* Section 5: Enterprise Reliability & Infrastructure Bento Grid */}
          <ReliabilityBentoSection />

          {/* Section 6: Core Architecture 2x2 Feature Matrix */}
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
