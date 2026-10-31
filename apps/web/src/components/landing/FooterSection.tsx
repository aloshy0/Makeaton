"use client";

import React from "react";
import Link from "next/link";

interface FooterSectionProps {
  mode: "personal" | "business";
  setMode: (mode: "personal" | "business") => void;
}

export function FooterSection({ mode, setMode }: FooterSectionProps) {
  return (
    <footer className="px-4 sm:px-6 lg:px-8 pb-12 w-full max-w-7xl mx-auto">
      {/* Light Rounded Container (Matching MONELIQ frame_38s.jpg) */}
      <div className="rounded-[2.5rem] bg-[#ededf0] p-8 sm:p-12 lg:p-16 border border-slate-200/80 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Brand Identity */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 block">
              FLOWGRID
            </span>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-normal">
              Keep your business in flow. Enterprise subscription management, recurring billing, and
              automated payment settlement.
            </p>
          </div>

          {/* 3 Nav Columns (Matching MONELIQ frame_38s.jpg) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-500">
            {/* Column 1: Sections */}
            <div className="space-y-3">
              <span className="font-bold text-slate-900 block text-xs">Sections</span>
              <ul className="space-y-2">
                <li>
                  <Link href="#product-intro" className="hover:text-black transition-colors">
                    Personal
                  </Link>
                </li>
                <li>
                  <Link href="#lifecycle" className="hover:text-black transition-colors">
                    Business
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-black transition-colors">
                    Company
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-black transition-colors font-medium"
                  >
                    Platform App
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Help */}
            <div className="space-y-3">
              <span className="font-bold text-slate-900 block text-xs">Help</span>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Complaints
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    API Documentation
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Company Policies */}
            <div className="space-y-3">
              <span className="font-bold text-slate-900 block text-xs">Company policies</span>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Website terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Legal Agreements
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    Modern Slavery Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition-colors">
                    SOC 2 Certification
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar with Socials and Mode Toggle (Matching frame_38s.jpg) */}
        <div className="pt-8 border-t border-slate-300/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>© 2026 FlowGrid Inc. All rights reserved. Keep your business in flow.</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Social Icons */}
            <div className="flex items-center gap-4 text-slate-700">
              <a href="#" className="hover:text-black transition-colors font-semibold">
                𝕏
              </a>
              <a href="#" className="hover:text-black transition-colors font-semibold">
                in
              </a>
              <a href="#" className="hover:text-black transition-colors font-semibold">
                fb
              </a>
            </div>

            {/* Mode Toggle Switch Pill */}
            <div className="flex rounded-full bg-white p-1 border border-slate-300 text-xs font-semibold shadow-xs">
              <button
                onClick={() => setMode("personal")}
                className={`px-3 py-1 rounded-full transition-all ${
                  mode === "personal"
                    ? "bg-black text-white shadow-sm"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => setMode("business")}
                className={`px-3 py-1 rounded-full transition-all ${
                  mode === "business"
                    ? "bg-black text-white shadow-sm"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                Business
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
