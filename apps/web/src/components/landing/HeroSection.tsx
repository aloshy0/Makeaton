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
  UserCheck,
  Building2,
  Users,
  Compass,
  X,
  Rocket,
  Briefcase,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccount } from "../../context/account-context";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface HeroSectionProps {
  mode: "personal" | "business";
  setMode: (mode: "personal" | "business") => void;
}

export function HeroSection({ mode, setMode }: HeroSectionProps) {
  const router = useRouter();
  const { login, switchContext, switchWorkspace, memberships } = useAccount();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
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

      // H. Pro card receives a subtle elevated shadow
      scrollTl.to(
        planCardProRef.current,
        {
          boxShadow: "0 20px 45px -10px rgba(37,99,235,0.18), 0 4px 16px rgba(37,99,235,0.06)",
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
      className="relative w-full min-h-screen bg-white z-20 overflow-hidden pt-20"
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

      {/* Main Pinned Viewport Stage - Perfectly Centered in Visible Viewport Below Navbar */}
      <div className="relative w-full h-[calc(100vh-5rem)] min-h-[640px] flex items-center justify-center overflow-hidden">
        <div
          ref={containerRef}
          className="w-full max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-12 relative z-10 flex items-center justify-between h-full min-h-[580px]"
        >
          {/* ================================================================ */}
          {/* SLIDE 1: Hero Layout (Left Column)                               */}
          {/* ================================================================ */}
          <div
            ref={slide1LeftRef}
            className="absolute left-6 sm:left-10 lg:left-12 top-0 bottom-0 my-auto h-fit max-w-xl xl:max-w-2xl z-20 flex flex-col items-start space-y-6 lg:space-y-8 will-change-transform"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-50 border border-slate-200/90 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
              <span className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight">
                FlowGrid 2.0
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs sm:text-sm font-medium text-slate-600">
                Next-Gen Subscription Platform
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-[72px] xl:text-[78px] font-black tracking-[-0.035em] text-slate-950 leading-[1.04]">
              Keep your business <br />
              <span className="bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4] bg-clip-text text-transparent">
                in flow.
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-slate-500 font-normal leading-relaxed max-w-lg">
              Manage subscriptions, recurring billing, products, customers and payments from one
              connected platform.
            </p>

            {/* CTAs Row */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-md active:scale-95 group font-heading"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-sm font-semibold transition-all shadow-xs active:scale-95 group"
              >
                <Compass className="w-4 h-4 text-purple-600" />
                <span>Explore Demo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById("billing");
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-sm font-semibold transition-all shadow-xs active:scale-95 group"
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  <Play className="w-3 h-3 fill-slate-800 text-slate-800 ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* 3-Column Stats Row */}
            <div
              ref={statsRef}
              className="w-full pt-8 lg:pt-9 border-t border-slate-100 grid grid-cols-3 gap-6 max-w-lg"
            >
              <div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                  10K+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                  Businesses
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                  2M+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                  Subscriptions
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                  99.9%
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Uptime</div>
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
            className="absolute left-6 sm:left-10 lg:left-12 top-0 bottom-0 my-auto h-fit max-w-md lg:max-w-xl z-20 flex flex-col items-start space-y-6 will-change-transform"
          >
            {/* Pill Badge */}
            <div ref={slide2LeftRef} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/70 border border-purple-200/50 text-xs font-bold tracking-wider uppercase text-purple-700 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
                <span>ORGANIZE PRODUCTS</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-4xl sm:text-5xl lg:text-[62px] xl:text-[68px] font-black tracking-[-0.035em] text-slate-950 leading-[1.06]">
                Everything you sell. <br />
                In{" "}
                <span className="bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4] bg-clip-text text-transparent">
                  one place.
                </span>
              </h2>

              {/* Subtitle Description */}
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-lg">
                Add your products, organize your services and manage pricing effortlessly. Build the
                foundation for your subscription business with FlowGrid.
              </p>
            </div>

            {/* Three Key Highlights Stacked Vertically */}
            <div ref={highlightsRef} className="space-y-4 pt-1 w-full">
              {/* Highlight 1: Organize Products */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100/80 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Box className="w-5.5 h-5.5 text-[#8b5cf6] stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    Organize Products
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Manage all your physical and digital products in one place.
                  </p>
                </div>
              </div>

              {/* Highlight 2: Flexible Pricing */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Tag className="w-5.5 h-5.5 text-[#3b82f6] stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    Flexible Pricing
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
                    Set sales prices, costs and product variants with ease.
                  </p>
                </div>
              </div>

              {/* Highlight 3: Subscription Ready */}
              <div className="flex items-start gap-3.5 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Layers className="w-5.5 h-5.5 text-[#10b981] stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    Subscription Ready
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">
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
            className="ml-auto relative flex items-center justify-center will-change-transform z-30 my-auto"
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
                <div className="flex items-center justify-between pb-3.5 relative z-10">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Products
                  </h3>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6366f1] hover:bg-indigo-600 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add product</span>
                  </button>
                </div>

                {/* Search Field */}
                <div className="relative z-10 mb-4">
                  <div className="flex items-center gap-2 bg-slate-50/90 border border-slate-200/60 rounded-xl px-3.5 py-2 text-xs text-slate-400 shadow-inner">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400 font-normal">Search products...</span>
                  </div>
                </div>

                {/* Product Entries List */}
                <div ref={productRowsRef} className="space-y-2.5 relative z-10">
                  {/* Entry 1: Cloud Software */}
                  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/70 transition-colors border border-slate-100/60 bg-white">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Laptop className="w-4.5 h-4.5 text-[#8b5cf6]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 leading-tight">
                          Cloud Software
                        </div>
                        <div className="text-xs text-slate-400 font-medium leading-tight mt-0.5">
                          Software
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 font-mono">₹999</span>
                        <span className="text-xs text-slate-400 font-normal"> /month</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100/60">
                        Active
                      </span>
                      <MoreHorizontal className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>

                  {/* Entry 2: Gym Membership */}
                  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/70 transition-colors border border-slate-100/60 bg-white">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Dumbbell className="w-4.5 h-4.5 text-[#3b82f6]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 leading-tight">
                          Gym Membership
                        </div>
                        <div className="text-xs text-slate-400 font-medium leading-tight mt-0.5">
                          Service
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 font-mono">₹500</span>
                        <span className="text-xs text-slate-400 font-normal"> /month</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100/60">
                        Active
                      </span>
                      <MoreHorizontal className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>

                  {/* Entry 3: Online Course */}
                  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50/70 transition-colors border border-slate-100/60 bg-white">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4.5 h-4.5 text-[#10b981]" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 leading-tight">
                          Online Course
                        </div>
                        <div className="text-xs text-slate-400 font-medium leading-tight mt-0.5">
                          Education
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 font-mono">₹1,499</span>
                        <span className="text-xs text-slate-400 font-normal"> /month</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100/60">
                        Active
                      </span>
                      <MoreHorizontal className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* NOTIFICATION 1: Product Created (Top-Left Floating Card)     */}
              {/* ------------------------------------------------------------ */}
              <div
                ref={notif1Ref}
                className="absolute top-2 sm:top-6 -left-2 sm:-left-6 z-30 bg-white/95 backdrop-blur-md border border-slate-100/90 rounded-2xl p-3.5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] flex items-center gap-3.5 will-change-transform max-w-[260px] sm:max-w-[290px]"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Box className="w-4.5 h-4.5 text-[#8b5cf6]" />
                </div>
                <div className="pr-2">
                  <div className="text-sm font-bold text-slate-900 leading-tight">
                    Product Created
                  </div>
                  <div className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                    Cloud Software added successfully
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] shadow-[0_0_6px_rgba(139,92,246,0.6)] ml-auto shrink-0" />
              </div>

              {/* ------------------------------------------------------------ */}
              {/* NOTIFICATION 2: Pricing Updated (Bottom-Left Floating Card)  */}
              {/* ------------------------------------------------------------ */}
              <div
                ref={notif2Ref}
                className="absolute bottom-6 sm:bottom-10 left-2 sm:left-6 z-30 bg-white/95 backdrop-blur-md border border-slate-100/90 rounded-2xl p-3.5 shadow-[0_14px_30px_rgba(0,0,0,0.06)] flex items-center gap-3.5 will-change-transform max-w-[230px] sm:max-w-[260px]"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4.5 h-4.5 text-[#3b82f6]" />
                </div>
                <div className="pr-2">
                  <div className="text-sm font-bold text-slate-900 leading-tight">
                    Pricing Updated
                  </div>
                  <div className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                    Set sales prices & costs
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_6px_rgba(59,130,246,0.6)] ml-auto shrink-0" />
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
            className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-2 max-w-[1240px] mx-auto will-change-transform pointer-events-none"
          >
            {/* Top Centered Notification: "Ready for Plans" (Travels from Slide 2) */}
            <div className="relative z-40 flex flex-col items-center">
              <div
                ref={readyForPlansCardRef}
                style={{ opacity: 0 }}
                className="bg-white/95 backdrop-blur-md border border-slate-100/90 rounded-2xl sm:rounded-3xl px-6 py-3 sm:py-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.06)] flex items-center gap-3.5 max-w-[340px] will-change-transform select-none"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-400 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-4.5 h-4.5 stroke-[3]" />
                </div>
                <div className="text-left pr-1">
                  <div className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    Ready for Plans
                  </div>
                  <div className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                    Turn products into subscription plans
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] ml-auto shrink-0 self-start mt-0.5" />
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f3e8ff] border border-[#e9d5ff] text-[11px] sm:text-xs font-bold tracking-wider uppercase text-[#7c3aed] shadow-xs mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                <span>SUBSCRIPTION PLANS</span>
              </div>

              {/* Heading */}
              <h2 className="text-4xl sm:text-5xl lg:text-[52px] xl:text-[58px] font-black tracking-[-0.035em] text-slate-950 leading-[1.06]">
                Plans that fit <br />
                <span className="bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4] bg-clip-text text-transparent">
                  your business.
                </span>
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed text-center max-w-xl mt-2.5">
                Turn your products into flexible subscription plans.{" "}
                <br className="hidden sm:inline" />
                Set pricing, choose billing cycles and define the terms that work for your business.
              </p>
            </div>

            {/* Centered Segmented Billing Cycle Selector */}
            <div
              ref={billingToggleRef}
              style={{ opacity: 0 }}
              className="relative z-10 inline-flex items-center p-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-inner mt-4 sm:mt-5 mb-5 sm:mb-6"
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
                    className={`relative px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-white text-slate-900 font-bold shadow-sm"
                        : "text-slate-500 font-semibold hover:text-slate-800"
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
                className="rounded-[28px] sm:rounded-[32px] bg-white border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between shadow-[0_10px_30px_-5px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.08)] transition-all duration-300 group relative text-left"
              >
                <div>
                  {/* Top: Icon + Plan Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                      <Box className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-base font-bold text-slate-900">Basic</span>
                  </div>

                  <h3 className="text-2xl sm:text-[26px] font-black text-slate-950 tracking-tight mb-1">
                    Get started
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-normal mb-4">
                    Essential tools to get started.
                  </p>

                  <div className="flex items-baseline gap-1.5 mb-5">
                    <span className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight font-sans">
                      {planPrices.basic[billingCycle]}
                    </span>
                    <span className="text-sm sm:text-base text-slate-400 font-normal">
                      /{intervalLabels[billingCycle]}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="w-full py-3 px-5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm sm:text-base font-bold transition-all shadow-2xs cursor-pointer mb-5"
                  >
                    Choose Basic
                  </button>

                  <div className="border-t border-slate-100 mb-5" />

                  <ul className="space-y-3">
                    {["1 Product", "Basic Features", "Email Support"].map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-3 text-sm sm:text-[15px] text-slate-700 font-medium"
                      >
                        <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card 2: Pro (HIGHLIGHTED - RECOMMENDED) */}
              <div
                ref={planCardProRef}
                style={{ opacity: 0 }}
                className="relative rounded-[28px] sm:rounded-[32px] bg-[#f5f8ff] border-2 border-[#3b82f6] p-6 sm:p-7 flex flex-col justify-between shadow-[0_20px_45px_-10px_rgba(37,99,235,0.18),0_4px_16px_rgba(37,99,235,0.06)] md:-translate-y-2 z-20 transition-all duration-300 group text-left"
              >
                <div>
                  {/* Top: Icon + Plan Name + RECOMMENDED Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-100/80 flex items-center justify-center text-[#2563eb] shrink-0">
                        <Rocket className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="text-base font-bold text-slate-900">Pro</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100/90 text-[#1d4ed8] text-[10px] font-bold tracking-wider uppercase">
                      RECOMMENDED
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-[26px] font-black text-slate-950 tracking-tight mb-1">
                    Grow with confidence
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-normal mb-4">
                    Everything you need to grow.
                  </p>

                  <div className="flex items-baseline gap-1.5 mb-5">
                    <span className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight font-sans">
                      {planPrices.pro[billingCycle]}
                    </span>
                    <span className="text-sm sm:text-base text-slate-500 font-normal">
                      /{intervalLabels[billingCycle]}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="w-full py-3 px-5 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer mb-5"
                  >
                    Choose Pro
                  </button>

                  <div className="border-t border-blue-200/50 mb-5" />

                  <ul className="space-y-3">
                    {["Up to 10 Products", "Advanced Features", "Priority Support"].map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-3 text-sm sm:text-[15px] text-slate-800 font-medium"
                      >
                        <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card 3: Business */}
              <div
                ref={planCardBusinessRef}
                style={{ opacity: 0 }}
                className="rounded-[28px] sm:rounded-[32px] bg-white border border-slate-200/90 p-6 sm:p-7 flex flex-col justify-between shadow-[0_10px_30px_-5px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.08)] transition-all duration-300 group relative text-left"
              >
                <div>
                  {/* Top: Icon + Plan Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#4f46e5] shrink-0">
                      <Briefcase className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-base font-bold text-slate-900">Business</span>
                  </div>

                  <h3 className="text-2xl sm:text-[26px] font-black text-slate-950 tracking-tight mb-1">
                    Built for scale
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-normal mb-4">
                    Built for large businesses.
                  </p>

                  <div className="flex items-baseline gap-1.5 mb-5">
                    <span className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight font-sans">
                      {planPrices.business[billingCycle]}
                    </span>
                    <span className="text-sm sm:text-base text-slate-400 font-normal">
                      /{intervalLabels[billingCycle]}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="w-full py-3 px-5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm sm:text-base font-bold transition-all shadow-2xs cursor-pointer mb-5"
                  >
                    Choose Business
                  </button>

                  <div className="border-t border-slate-100 mb-5" />

                  <ul className="space-y-3">
                    {["Unlimited Products", "Advanced Features", "Dedicated Support"].map(
                      (feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-3 text-sm sm:text-[15px] text-slate-700 font-medium"
                        >
                          <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span>{feat}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explore Demo Modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-7 sm:p-8 shadow-2xl border border-slate-100">
            <button
              onClick={() => setIsDemoModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                Live Prototype Demo
              </span>
            </div>

            <h3 className="text-xl font-heading font-extrabold text-[#0B1020]">
              Explore FlowGrid Environment
            </h3>
            <p className="text-xs text-[#64748B] mt-1 mb-6">
              Select an account persona below to instantly experience FlowGrid without manual
              registration.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={async () => {
                  setIsDemoModalOpen(false);
                  await login({ email: "owner@flowgrid.com", password: "StrongPassword123!" });
                }}
                className="w-full text-left p-3.5 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-[#0B1020]">
                        Workspace Owner
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        Full Authority
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Financial KPIs, billing cycles, quotas, and business settings
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsDemoModalOpen(false);
                  await login({ email: "demo@flowgrid.local", password: "FlowGrid2026!Demo" });
                }}
                className="w-full text-left p-3.5 rounded-2xl border border-blue-200 bg-blue-50/40 hover:bg-blue-100/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-[#0B1020]">
                        Administrator
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Operations
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Manage catalog, issue quotations, review invoices & staff
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsDemoModalOpen(false);
                  await login({ email: "staff@flowgrid.com", password: "StrongPassword123!" });
                }}
                className="w-full text-left p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-[#0B1020]">
                        Operational Staff
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                        Task Scoped
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Assigned subscriptions, customers, and approval requests
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsDemoModalOpen(false);
                  await login({ email: "customer@acme.com", password: "StrongPassword123!" });
                }}
                className="w-full text-left p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-[#0B1020]">
                        Personal Customer
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Self-Service
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Active subscriptions, remaining quota gauges, renewals & receipts
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
