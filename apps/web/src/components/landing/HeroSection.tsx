"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Search,
  Box,
  Tag,
  Layers,
  Laptop,
  Dumbbell,
  GraduationCap,
  FileText,
  Check,
  MoreHorizontal,
  Plus,
  Repeat,
  ShieldCheck,
  Sparkles,
  Crown,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface HeroSectionProps {
  mode: "personal" | "business";
  setMode: (mode: "personal" | "business") => void;
}

export function HeroSection({ mode, setMode }: HeroSectionProps) {
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Billing Cycle Toggle State for Slide 3 Plans
  const [billingCycle, setBillingCycle] = useState<"daily" | "weekly" | "monthly" | "yearly">(
    "monthly"
  );

  const planPrices = {
    basic: { daily: "₹25", weekly: "₹149", monthly: "₹499", yearly: "₹4,990" },
    pro: { daily: "₹49", weekly: "₹299", monthly: "₹999", yearly: "₹9,990" },
    business: { daily: "₹99", weekly: "₹599", monthly: "₹1,999", yearly: "₹19,990" },
  };

  const intervalLabels = {
    daily: "day",
    weekly: "week",
    monthly: "month",
    yearly: "year",
  };

  // Slide 1 Refs
  const slide1LeftRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Slide 2 Refs
  const slide2ContainerRef = useRef<HTMLDivElement>(null);
  const slide2LeftRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);

  // Slide 3 Refs
  const slide3ContainerRef = useRef<HTMLDivElement>(null);
  const readyForPlansCardRef = useRef<HTMLDivElement>(null);
  const slide3SplineWrapperRef = useRef<HTMLDivElement>(null);
  const slide3SplineRef = useRef<SVGPathElement>(null);
  const slide3SplineDotRef = useRef<SVGCircleElement>(null);
  const slide3HeaderRef = useRef<HTMLDivElement>(null);
  const billingToggleRef = useRef<HTMLDivElement>(null);
  const plansWrapperRef = useRef<HTMLDivElement>(null);
  const planCardBasicRef = useRef<HTMLDivElement>(null);
  const planCardProRef = useRef<HTMLDivElement>(null);
  const planCardBusinessRef = useRef<HTMLDivElement>(null);

  // Right-side Illustration Composition Refs (Slide 2)
  const illustrationWrapperRef = useRef<HTMLDivElement>(null);
  const productPanelRef = useRef<HTMLDivElement>(null);
  const productRowsRef = useRef<HTMLDivElement>(null);
  const brandCardRef = useRef<HTMLDivElement>(null);
  const notif1Ref = useRef<HTMLDivElement>(null);
  const notif2Ref = useRef<HTMLDivElement>(null);
  const slide2NotifAnchorRef = useRef<HTMLDivElement>(null);

  // Connecting SVG Splines Refs (Slide 2)
  const spline1Ref = useRef<SVGPathElement>(null);
  const spline2Ref = useRef<SVGPathElement>(null);
  const spline3Ref = useRef<SVGPathElement>(null);

  // Transformation Spline Lines (Products -> Plans for Slide 2 to Slide 3)
  const transformSplinesRef = useRef<SVGSVGElement>(null);
  const transformPath1Ref = useRef<SVGPathElement>(null);
  const transformPath2Ref = useRef<SVGPathElement>(null);
  const transformPath3Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Initial Page Load Animations (Slide 1 Hero)
      if (slide1LeftRef.current) {
        gsap.fromTo(
          slide1LeftRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
          }
        );
      }

      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.children,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.45,
            stagger: 0.08,
            ease: "power2.out",
          }
        );
      }

      // Initial Right Composition Entrance on Page Load
      if (productPanelRef.current) {
        gsap.fromTo(
          productPanelRef.current,
          {
            opacity: 0,
            y: 50,
            rotateY: -22,
            rotateX: 14,
            scale: 0.94,
          },
          {
            opacity: 1,
            y: 0,
            rotateY: -10,
            rotateX: 6,
            scale: 1,
            duration: 1.2,
            delay: 0.2,
            ease: "expo.out",
          }
        );
        gsap.to(productPanelRef.current, {
          y: -8,
          duration: 3.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (brandCardRef.current) {
        gsap.fromTo(
          brandCardRef.current,
          { opacity: 0, scale: 0.9, x: 30 },
          {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 1.2,
            delay: 0.35,
            ease: "expo.out",
          }
        );
        gsap.to(brandCardRef.current, {
          y: -6,
          duration: 4.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.4,
        });
      }

      if (notif1Ref.current) {
        gsap.fromTo(
          notif1Ref.current,
          { opacity: 0, scale: 0.85, y: -20 },
          { opacity: 1, scale: 1, y: 0, duration: 1, delay: 0.5, ease: "back.out(1.5)" }
        );
        gsap.to(notif1Ref.current, {
          y: -7,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.5,
        });
      }

      if (notif2Ref.current) {
        gsap.fromTo(
          notif2Ref.current,
          { opacity: 0, scale: 0.85, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 1, delay: 0.65, ease: "back.out(1.5)" }
        );
        gsap.to(notif2Ref.current, {
          y: 6,
          duration: 3.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.7,
        });
      }

      // 2. Setup Spline Paths Stroke Lengths for progressive drawing
      [spline1Ref.current, spline2Ref.current, spline3Ref.current].forEach((spline) => {
        if (spline) {
          const len = spline.getTotalLength ? spline.getTotalLength() : 350;
          gsap.set(spline, {
            strokeDasharray: len,
            strokeDashoffset: len,
          });
        }
      });

      // Setup Transform Spline paths lengths
      [transformPath1Ref.current, transformPath2Ref.current, transformPath3Ref.current].forEach(
        (spline) => {
          if (spline) {
            const len = spline.getTotalLength ? spline.getTotalLength() : 450;
            gsap.set(spline, {
              strokeDasharray: len,
              strokeDashoffset: len,
            });
          }
        }
      );

      // Setup Slide 3 Connecting Spline path length and terminal dot
      if (slide3SplineRef.current) {
        const len = slide3SplineRef.current.getTotalLength
          ? slide3SplineRef.current.getTotalLength()
          : 60;
        gsap.set(slide3SplineRef.current, {
          strokeDasharray: len,
          strokeDashoffset: len,
        });
      }

      if (slide3SplineDotRef.current) {
        gsap.set(slide3SplineDotRef.current, {
          transformOrigin: "center center",
          scale: 0,
        });
      }

      // Dynamic offset calculation: Distance from Slide 3 resting position (0, 0) to Slide 2 anchor
      const getSlide2Offset = () => {
        if (!readyForPlansCardRef.current || !slide2NotifAnchorRef.current) {
          return { x: 440, y: 390 };
        }
        const curX = (gsap.getProperty(readyForPlansCardRef.current, "x") as number) || 0;
        const curY = (gsap.getProperty(readyForPlansCardRef.current, "y") as number) || 0;
        const cardRect = readyForPlansCardRef.current.getBoundingClientRect();
        const anchorRect = slide2NotifAnchorRef.current.getBoundingClientRect();

        if (cardRect.width === 0 || anchorRect.width === 0) {
          return { x: 440, y: 390 };
        }

        // Account for illustrationWrapperRef horizontal shift if called before shift completes
        const currentWrapperX = illustrationWrapperRef.current
          ? (gsap.getProperty(illustrationWrapperRef.current, "x") as number) || 0
          : 0;
        const targetWrapperX = typeof window !== "undefined" && window.innerWidth >= 1280 ? 40 : 0;
        const wrapperShift = targetWrapperX - currentWrapperX;

        return {
          x:
            curX +
            (anchorRect.left +
              wrapperShift +
              anchorRect.width / 2 -
              (cardRect.left + cardRect.width / 2)),
          y: curY + (anchorRect.top + anchorRect.height / 2 - (cardRect.top + cardRect.height / 2)),
        };
      };

      if (readyForPlansCardRef.current) {
        gsap.set(readyForPlansCardRef.current, {
          x: () => getSlide2Offset().x,
          y: () => getSlide2Offset().y,
          opacity: 0,
          scale: 0.85,
        });
      }

      // 3. MASTER PINNED SCROLL TIMELINE: Slide 1 -> Slide 2 -> Slide 3 Transition
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: pinSectionRef.current,
          start: "top top",
          end: "+=320%",
          pin: true,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          refreshPriority: 10,
          invalidateOnRefresh: true,
        },
      });

      // A. Slide 1 left hero content retreats smoothly
      scrollTl.to(
        slide1LeftRef.current,
        {
          opacity: 0,
          x: -100,
          scale: 0.92,
          filter: "blur(6px)",
          pointerEvents: "none",
          duration: 0.45,
          ease: "power2.inOut",
        },
        0
      );

      // B. Right illustration shifts into position for Slide 2
      scrollTl.to(
        illustrationWrapperRef.current,
        {
          x: () => (window.innerWidth >= 1280 ? 40 : 0),
          duration: 0.55,
          ease: "power2.inOut",
        },
        0
      );

      // C. Slide 2 elements reveal smoothly
      scrollTl.to(
        slide2ContainerRef.current,
        {
          opacity: 1,
          pointerEvents: "auto",
          duration: 0.5,
          ease: "power2.out",
        },
        0.15
      );

      scrollTl.fromTo(
        slide2LeftRef.current,
        { opacity: 0, x: -60 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
        0.2
      );

      // D. Three Highlights Reveal Sequentially
      if (highlightsRef.current) {
        scrollTl.fromTo(
          highlightsRef.current.children,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.08,
            duration: 0.45,
            ease: "power2.out",
          },
          0.25
        );
      }

      // E. Product Rows Reveal Sequentially
      if (productRowsRef.current) {
        scrollTl.fromTo(
          productRowsRef.current.children,
          { opacity: 0.3, y: 15 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.06,
            duration: 0.4,
            ease: "power2.out",
          },
          0.3
        );
      }

      // F. Connecting Spline Lines Draw Progressively
      [spline1Ref.current, spline2Ref.current, spline3Ref.current].forEach((spline) => {
        if (spline) {
          scrollTl.to(
            spline,
            {
              strokeDashoffset: 0,
              duration: 0.5,
              ease: "none",
            },
            0.25
          );
        }
      });

      // Ready for Plans Card reveals at Slide 2 anchor position
      if (readyForPlansCardRef.current) {
        scrollTl.fromTo(
          readyForPlansCardRef.current,
          {
            opacity: 0,
            scale: 0.85,
            x: () => getSlide2Offset().x,
            y: () => getSlide2Offset().y,
          },
          {
            opacity: 1,
            scale: 1,
            x: () => getSlide2Offset().x,
            y: () => getSlide2Offset().y,
            duration: 0.45,
            ease: "back.out(1.4)",
          },
          0.25
        );
      }

      // Holding state: keeps Slide 2 in full view for user to inspect
      scrollTl.to({}, { duration: 0.35 });

      // ================================================================
      // PHASE 2: "Ready for Plans" Flies from Slide 2 into Slide 3
      // ================================================================

      // A. Slide 2 left content retreats UP
      scrollTl.to(
        slide2ContainerRef.current,
        {
          opacity: 0,
          y: -70,
          filter: "blur(6px)",
          pointerEvents: "none",
          duration: 0.35,
          ease: "power2.inOut",
        },
        0.85
      );

      // B. Entire Slide 2 illustration composition (panel, brand card, notifs, splines) fades out cleanly
      scrollTl.to(
        illustrationWrapperRef.current,
        {
          opacity: 0,
          y: -40,
          scale: 0.92,
          duration: 0.35,
          ease: "power2.in",
        },
        0.85
      );

      // C. THE HERO ANIMATION: readyForPlansCardRef glides smoothly from Slide 2 position to (0, 0)
      if (readyForPlansCardRef.current) {
        scrollTl.to(
          readyForPlansCardRef.current,
          {
            x: 0,
            y: 0,
            scale: 1,
            boxShadow: "0 16px 36px -8px rgba(0,0,0,0.08)",
            duration: 0.38,
            ease: "power2.inOut",
          },
          0.85
        );
      }

      // D. Connecting curved spline line extends downward as the card settles at top-center
      if (slide3SplineWrapperRef.current) {
        scrollTl.fromTo(
          slide3SplineWrapperRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.15 },
          1.2
        );
      }

      if (slide3SplineRef.current) {
        scrollTl.fromTo(
          slide3SplineRef.current,
          { strokeDashoffset: () => slide3SplineRef.current?.getTotalLength() || 60 },
          {
            strokeDashoffset: 0,
            duration: 0.22,
            ease: "power1.inOut",
          },
          1.2
        );
      }

      if (slide3SplineDotRef.current) {
        scrollTl.fromTo(
          slide3SplineDotRef.current,
          { scale: 0 },
          {
            scale: 1,
            duration: 0.16,
            ease: "back.out(2)",
          },
          1.32
        );
      }

      // E. Centered Header (Badge, Heading, Description) reveals smoothly
      scrollTl.fromTo(
        slide3HeaderRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
        1.32
      );

      // F. Segmented Billing Cycle Selector appears
      scrollTl.fromTo(
        billingToggleRef.current,
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
        1.4
      );

      // G. Basic, Pro, Business cards enter sequentially
      scrollTl.fromTo(
        planCardBasicRef.current,
        { opacity: 0, y: 35, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" },
        1.46
      );

      scrollTl.fromTo(
        planCardProRef.current,
        { opacity: 0, y: 45, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.4)" },
        1.52
      );

      scrollTl.fromTo(
        planCardBusinessRef.current,
        { opacity: 0, y: 35, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" },
        1.58
      );

      // H. Pro card receives a subtle glow animation
      scrollTl.to(
        planCardProRef.current,
        {
          boxShadow: "0 22px 65px -8px rgba(99,102,241,0.55), 0 0 45px rgba(99,102,241,0.32)",
          duration: 0.3,
          ease: "power2.out",
        },
        1.68
      );

      // Enable pointer events on Slide 3
      scrollTl.set(slide3ContainerRef.current, { pointerEvents: "auto" }, 1.46);

      // Holding state: keeps Slide 3 in full view for user to inspect & interact
      scrollTl.to({}, { duration: 0.8 });

      // ================================================================
      // PHASE 3: FINAL TRANSITION INTO CUSTOMER SUBSCRIPTIONS & BILLING
      // ================================================================
      scrollTl.to(
        slide3ContainerRef.current,
        {
          y: -80,
          opacity: 0,
          scale: 0.96,
          filter: "blur(6px)",
          pointerEvents: "none",
          duration: 0.45,
          ease: "power2.inOut",
        },
        2.5
      );
    }, pinSectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={pinSectionRef}
      id="hero"
      className="relative w-full min-h-screen bg-white z-20 overflow-hidden"
    >
      {/* Background Purple, Blue and Mint Ambient Lighting */}
      <div
        className="absolute top-1/6 right-1/4 w-[520px] h-[520px] rounded-full bg-purple-200/35 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 right-1/3 w-[460px] h-[460px] rounded-full bg-blue-100/40 blur-[130px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-6 right-6 sm:right-12 w-[540px] h-[540px] rounded-full bg-emerald-200/40 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Pinned Viewport Stage */}
      <div className="relative w-full h-screen flex items-center justify-center py-2 sm:py-4 overflow-hidden">
        <div
          ref={containerRef}
          className="w-full max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10 flex items-center min-h-[600px]"
        >
          {/* ================================================================ */}
          {/* SLIDE 1: Hero Layout (Left Column)                               */}
          {/* ================================================================ */}
          <div
            ref={slide1LeftRef}
            className="absolute left-6 sm:left-10 lg:left-12 max-w-xl z-20 flex flex-col items-start space-y-6 lg:space-y-8 will-change-transform"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
              <span className="text-xs font-semibold text-slate-800 tracking-tight">
                FlowGrid 2.0
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-medium text-slate-600">
                Next-Gen Subscription Platform
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[62px] xl:text-[68px] font-black tracking-[-0.035em] text-slate-950 leading-[1.06]">
              Keep your business <br />
              <span className="bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4] bg-clip-text text-transparent">
                in flow.
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed max-w-lg">
              Manage subscriptions, automate recurring billing and keep every payment on track. All
              from one unified platform.
            </p>

            {/* CTAs Row */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-md active:scale-95 group"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById("billing");
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-sm font-semibold transition-all shadow-xs active:scale-95 group"
              >
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  <Play className="w-2.5 h-2.5 fill-slate-800 text-slate-800 ml-0.5" />
                </div>
                <span>Watch demo</span>
              </button>
            </div>

            {/* 3-Column Stats Row */}
            <div
              ref={statsRef}
              className="w-full pt-8 lg:pt-10 border-t border-slate-100 grid grid-cols-3 gap-6 max-w-md"
            >
              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                  10K+
                </div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">Businesses</div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                  2M+
                </div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">Subscriptions</div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                  99.9%
                </div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">Uptime</div>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* SLIDE 2: Product Management (Slide 2 Presentation)               */}
          {/* ================================================================ */}
          <div
            ref={slide2ContainerRef}
            id="products"
            style={{ opacity: 0, pointerEvents: "none" }}
            className="absolute left-6 sm:left-10 lg:left-12 max-w-md lg:max-w-lg z-20 flex flex-col items-start space-y-6 will-change-transform"
          >
            {/* Pill Badge */}
            <div ref={slide2LeftRef} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100/70 border border-purple-200/50 text-[11px] font-bold tracking-wider uppercase text-purple-700 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
                <span>ORGANIZE PRODUCTS</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-[54px] font-extrabold tracking-[-0.035em] text-slate-950 leading-[1.08]">
                Everything you sell. <br />
                In{" "}
                <span className="bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4] bg-clip-text text-transparent">
                  one place.
                </span>
              </h2>

              {/* Subtitle Description */}
              <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed max-w-md">
                Add your products, organize your services and manage pricing effortlessly. Build the
                foundation for your subscription business with FlowGrid.
              </p>
            </div>

            {/* Three Key Highlights Stacked Vertically */}
            <div ref={highlightsRef} className="space-y-4 pt-1 w-full">
              {/* Highlight 1: Organize Products */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100/80 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Box className="w-5 h-5 text-[#8b5cf6] stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    Organize Products
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                    Manage all your physical and digital products in one place.
                  </p>
                </div>
              </div>

              {/* Highlight 2: Flexible Pricing */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Tag className="w-5 h-5 text-[#3b82f6] stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    Flexible Pricing
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                    Set sales prices, costs and product variants with ease.
                  </p>
                </div>
              </div>

              {/* Highlight 3: Subscription Ready */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Layers className="w-5 h-5 text-[#10b981] stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    Subscription Ready
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                    Turn your products into flexible subscription plans.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* RIGHT-SIDE ILLUSTRATION: Product Collection Composition           */}
          {/* ================================================================ */}
          <div
            ref={illustrationWrapperRef}
            className="ml-auto relative flex items-center justify-center will-change-transform z-30"
          >
            {/* 3D Perspective Box */}
            <div
              className="relative w-[360px] sm:w-[500px] md:w-[560px] lg:w-[640px] xl:w-[680px] h-[520px] sm:h-[560px] flex items-center justify-center"
              style={{ perspective: "1400px" }}
            >
              {/* Connecting Curved SVG Spline Paths (Behind UI Elements) */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden sm:block"
                viewBox="0 0 680 560"
                fill="none"
              >
                <defs>
                  {/* Purple Spline for Product Created */}
                  <linearGradient id="purplePath" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.35" />
                  </linearGradient>

                  {/* Blue Spline for Pricing Updated */}
                  <linearGradient id="bluePath" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.35" />
                  </linearGradient>

                  {/* Mint Green Spline for Ready for Plans */}
                  <linearGradient id="mintPath" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.85" />
                  </linearGradient>
                </defs>

                {/* Spline 1 (Purple): Notification 1 to Product Panel */}
                <path
                  ref={spline1Ref}
                  d="M 320 135 C 320 180, 310 190, 340 230"
                  stroke="url(#purplePath)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Spline 2 (Blue): Notification 2 to Product Panel */}
                <path
                  ref={spline2Ref}
                  d="M 430 450 C 460 450, 460 380, 450 350"
                  stroke="url(#bluePath)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Spline 3 (Mint Green): Product Panel/Brand Card to Notification 3 */}
                <path
                  ref={spline3Ref}
                  d="M 545 320 C 585 330, 560 370, 570 410"
                  stroke="url(#mintPath)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>

              {/* ------------------------------------------------------------ */}
              {/* SUPPORTING ELEMENT: Smaller Tilted Brand Card Behind Panel    */}
              {/* ------------------------------------------------------------ */}
              <div
                ref={brandCardRef}
                style={{
                  transformStyle: "preserve-3d",
                  transform: "rotateY(-18deg) rotateX(10deg) rotateZ(6deg)",
                }}
                className="absolute right-0 sm:right-2 top-24 sm:top-28 w-40 sm:w-46 h-44 sm:h-52 rounded-[28px] bg-white/95 border border-slate-100 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.1)] flex items-center justify-center will-change-transform z-10"
              >
                <div className="flex items-center gap-2 select-none">
                  <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 4.5h16l-4.5 6H3v-6z" />
                    <path d="M3 13.5h11l-4.5 6.5H3v-6.5z" />
                  </svg>
                  <span className="text-sm font-black tracking-tight text-slate-950">FLOWGRID</span>
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* MAIN ELEMENT: Product Collection Panel (Floating White Panel) */}
              {/* ------------------------------------------------------------ */}
              <div
                ref={productPanelRef}
                style={{
                  transformStyle: "preserve-3d",
                  transform: "rotateY(-10deg) rotateX(6deg)",
                }}
                className="relative w-full max-w-[420px] sm:max-w-[470px] lg:max-w-[490px] rounded-[30px] sm:rounded-[34px] bg-white border border-slate-100/90 shadow-[0_30px_70px_-15px_rgba(20,25,45,0.12),0_15px_35px_-5px_rgba(20,25,45,0.06)] p-5 sm:p-6 will-change-transform z-20 overflow-hidden"
              >
                {/* Soft Glass Sheen Highlight */}
                <div
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/70 to-transparent pointer-events-none opacity-50"
                  aria-hidden="true"
                />

                {/* Header: Title + Add Product Action */}
                <div className="flex items-center justify-between pb-3 relative z-10">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Products
                  </h3>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#6366f1] hover:bg-indigo-600 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add product</span>
                  </button>
                </div>

                {/* Search Field */}
                <div className="relative z-10 mb-4">
                  <div className="flex items-center gap-2 bg-slate-50/90 border border-slate-200/60 rounded-xl px-3 py-1.5 text-xs text-slate-400 shadow-inner">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] text-slate-400 font-normal">
                      Search products...
                    </span>
                  </div>
                </div>

                {/* Product Entries List */}
                <div ref={productRowsRef} className="space-y-2.5 relative z-10">
                  {/* Entry 1: Cloud Software */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50/70 transition-colors border border-slate-100/60 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Laptop className="w-4 h-4 text-[#8b5cf6]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          Cloud Software
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                          Software
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 font-mono">₹999</span>
                        <span className="text-[10px] text-slate-400 font-normal"> /month</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100/60">
                        Active
                      </span>
                      <MoreHorizontal className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </div>

                  {/* Entry 2: Gym Membership */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50/70 transition-colors border border-slate-100/60 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Dumbbell className="w-4 h-4 text-[#3b82f6]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          Gym Membership
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                          Service
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 font-mono">₹500</span>
                        <span className="text-[10px] text-slate-400 font-normal"> /month</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100/60">
                        Active
                      </span>
                      <MoreHorizontal className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </div>

                  {/* Entry 3: Online Course */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50/70 transition-colors border border-slate-100/60 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4 text-[#10b981]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          Online Course
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                          Education
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 font-mono">₹1,499</span>
                        <span className="text-[10px] text-slate-400 font-normal"> /month</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100/60">
                        Active
                      </span>
                      <MoreHorizontal className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* NOTIFICATION 1: Product Created (Top-Left Floating Card)     */}
              {/* ------------------------------------------------------------ */}
              <div
                ref={notif1Ref}
                className="absolute top-2 sm:top-6 -left-2 sm:-left-6 z-30 bg-white/95 backdrop-blur-md border border-slate-100/90 rounded-2xl p-3 shadow-[0_14px_30px_rgba(0,0,0,0.06)] flex items-center gap-3 will-change-transform max-w-[240px] sm:max-w-[270px]"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Box className="w-4 h-4 text-[#8b5cf6]" />
                </div>
                <div className="pr-2">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    Product Created
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                    Cloud Software added successfully
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#8b5cf6] shadow-[0_0_6px_rgba(139,92,246,0.6)] ml-auto shrink-0" />
              </div>

              {/* ------------------------------------------------------------ */}
              {/* NOTIFICATION 2: Pricing Updated (Bottom-Left Floating Card)  */}
              {/* ------------------------------------------------------------ */}
              <div
                ref={notif2Ref}
                className="absolute bottom-6 sm:bottom-10 left-2 sm:left-6 z-30 bg-white/95 backdrop-blur-md border border-slate-100/90 rounded-2xl p-3 shadow-[0_14px_30px_rgba(0,0,0,0.06)] flex items-center gap-3 will-change-transform max-w-[210px] sm:max-w-[240px]"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#3b82f6]" />
                </div>
                <div className="pr-2">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    Pricing Updated
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                    Set sales prices & costs
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_6px_rgba(59,130,246,0.6)] ml-auto shrink-0" />
              </div>

              {/* ------------------------------------------------------------ */}
              {/* SLIDE 2 ANCHOR: Target Position for Ready for Plans in Slide 2 */}
              {/* ------------------------------------------------------------ */}
              <div
                ref={slide2NotifAnchorRef}
                className="absolute bottom-4 sm:bottom-8 -right-2 sm:-right-6 w-[280px] sm:w-[320px] h-[54px] pointer-events-none opacity-0"
              />
            </div>
          </div>

          {/* ================================================================ */}
          {/* SLIDE 3: SUBSCRIPTION PLANS (Centered Reference Layout)          */}
          {/* ================================================================ */}
          <div
            ref={slide3ContainerRef}
            id="plans"
            className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-[1240px] mx-auto will-change-transform pointer-events-none"
          >
            {/* Top Centered Notification: "Ready for Plans" (Travels from Slide 2) */}
            <div className="relative z-40 flex flex-col items-center">
              <div
                ref={readyForPlansCardRef}
                style={{ opacity: 0 }}
                className="bg-white/95 backdrop-blur-md border border-slate-100/90 rounded-2xl sm:rounded-3xl px-5 py-2.5 sm:py-3 shadow-[0_12px_30px_rgba(0,0,0,0.06)] flex items-center gap-3.5 max-w-[320px] will-change-transform select-none"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-400 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="text-left pr-1">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    Ready for Plans
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                    Turn products into subscription plans
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] ml-auto shrink-0 self-start mt-0.5" />
              </div>

              {/* S-curved Mint Connecting Spline with terminal dot */}
              <div
                ref={slide3SplineWrapperRef}
                style={{ opacity: 0 }}
                className="relative flex flex-col items-center -my-0.5"
              >
                <svg
                  width="36"
                  height="40"
                  viewBox="0 0 36 40"
                  fill="none"
                  className="overflow-visible"
                >
                  <path
                    ref={slide3SplineRef}
                    d="M 18 0 C 18 16, 28 20, 18 34"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle ref={slide3SplineDotRef} cx="18" cy="36" r="3" fill="#10b981" />
                </svg>
              </div>
            </div>

            {/* Centered Header: Badge, Heading, Description */}
            <div
              ref={slide3HeaderRef}
              style={{ opacity: 0 }}
              className="relative z-10 flex flex-col items-center text-center max-w-2xl px-2"
            >
              {/* Badge: SUBSCRIPTION PLANS */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3e8ff] border border-[#e9d5ff] text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#7c3aed] shadow-xs mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                <span>SUBSCRIPTION PLANS</span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-black tracking-[-0.035em] text-slate-950 leading-[1.08]">
                Plans that fit <br />
                <span className="bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4] bg-clip-text text-transparent">
                  your business.
                </span>
              </h2>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed text-center max-w-xl mt-2.5">
                Turn your products into flexible subscription plans.{" "}
                <br className="hidden sm:inline" />
                Set pricing, choose billing cycles and define the terms that work for your business.
              </p>
            </div>

            {/* Centered Segmented Billing Cycle Selector */}
            <div
              ref={billingToggleRef}
              style={{ opacity: 0 }}
              className="relative z-10 inline-flex items-center p-1 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-inner mt-4 sm:mt-5 mb-5 sm:mb-6"
            >
              {(["daily", "weekly", "monthly", "yearly"] as const).map((cycle) => {
                const isActive = billingCycle === cycle;
                const labels = {
                  daily: "Daily",
                  weekly: "Weekly",
                  monthly: "Monthly",
                  yearly: "Yearly",
                };
                return (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setBillingCycle(cycle)}
                    className={`relative px-4 sm:px-5 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-white text-slate-900 font-bold shadow-sm"
                        : "text-slate-500 font-medium hover:text-slate-800"
                    }`}
                  >
                    <span>{labels[cycle]}</span>
                  </button>
                );
              })}
            </div>

            {/* Three Pricing Cards in One Horizontal Row */}
            <div
              ref={plansWrapperRef}
              className="relative z-10 w-full max-w-[1080px] grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch"
            >
              {/* Card 1: Basic */}
              <div
                ref={planCardBasicRef}
                style={{ opacity: 0 }}
                className="rounded-[26px] sm:rounded-[28px] bg-[#0e121a] border border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.18)] transition-all duration-300 hover:border-white/20 group relative"
              >
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">Basic</h3>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                      {planPrices.basic[billingCycle]}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">
                      /{intervalLabels[billingCycle]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal mb-5">
                    Essential tools to get started.
                  </p>

                  <div className="border-t border-white/10 my-4" />

                  <ul className="space-y-3 mb-6">
                    {["1 Product", "Basic Features", "Email Support"].map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#352758] border border-[#7c3aed]/40 text-[#c084fc] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                >
                  Choose Basic
                </button>
              </div>

              {/* Card 2: Pro (HIGHLIGHTED) */}
              <div
                ref={planCardProRef}
                style={{ opacity: 0 }}
                className="relative rounded-[26px] sm:rounded-[28px] bg-gradient-to-b from-[#131742] via-[#0b0e27] to-[#070919] border-2 border-[#6366f1] p-6 sm:p-7 flex flex-col justify-between shadow-[0_20px_55px_-10px_rgba(99,102,241,0.5),0_0_35px_rgba(99,102,241,0.25)] md:-translate-y-2.5 z-20 transition-all duration-300 group"
              >
                {/* Floating "Most Popular" Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-[#8b5cf6] text-white text-[10px] font-bold tracking-wide uppercase shadow-[0_4px_12px_rgba(124,58,237,0.4)]">
                    <Crown className="w-3 h-3 fill-white" />
                    <span>Most Popular</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">Pro</h3>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                      {planPrices.pro[billingCycle]}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">
                      /{intervalLabels[billingCycle]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal mb-5">
                    Everything you need to grow.
                  </p>

                  <div className="border-t border-white/10 my-4" />

                  <ul className="space-y-3 mb-6">
                    {["Up to 10 Products", "Advanced Features", "Priority Support"].map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-3 text-xs sm:text-sm text-white font-medium"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#3d2c6e] border border-[#8b5cf6]/50 text-[#c084fc] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-slate-100 text-slate-950 text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-98 cursor-pointer"
                >
                  Choose Pro
                </button>
              </div>

              {/* Card 3: Business */}
              <div
                ref={planCardBusinessRef}
                style={{ opacity: 0 }}
                className="rounded-[26px] sm:rounded-[28px] bg-[#0e121a] border border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.18)] transition-all duration-300 hover:border-white/20 group relative"
              >
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">Business</h3>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                      {planPrices.business[billingCycle]}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">
                      /{intervalLabels[billingCycle]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal mb-5">
                    Built for large businesses.
                  </p>

                  <div className="border-t border-white/10 my-4" />

                  <ul className="space-y-3 mb-6">
                    {["Unlimited Products", "Advanced Features", "Dedicated Support"].map(
                      (feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#352758] border border-[#7c3aed]/40 text-[#c084fc] flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span>{feat}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                >
                  Choose Business
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
