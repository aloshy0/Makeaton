"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Loader2,
  Sparkles,
  Tag,
} from "lucide-react";
import { api, PortalOffer } from "../../../lib/api";
import { formatCurrency } from "../../../lib/utils";

function formatExpiry(endDate: string | null) {
  if (!endDate) return "No expiration date";
  return `Expires ${new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${endDate}T00:00:00`))}`;
}

export default function BrowsePlansPage() {
  const [offers, setOffers] = useState<PortalOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let didTimeout = false;
    const timeoutId = window.setTimeout(() => {
      didTimeout = true;
      if (isMounted) {
        setError("Offers are taking longer than expected to load. Please try again.");
        setIsLoading(false);
      }
    }, 15000);

    async function loadOffers() {
      setIsLoading(true);
      setError(null);
      try {
        const contexts = await api.getUserContexts();
        const businesses = contexts.personal_customer_context?.linked_businesses ?? [];
        if (businesses.length === 0) {
          if (isMounted && !didTimeout) setOffers([]);
          return;
        }

        const results = await Promise.allSettled(
          businesses.map((business) => api.getPortalOffers(business.workspace_id))
        );
        const successful = results.filter(
          (result): result is PromiseFulfilledResult<PortalOffer[]> => result.status === "fulfilled"
        );
        if (successful.length === 0 && results.length > 0) {
          throw new Error("We couldn’t load offers for your subscriptions. Please try again.");
        }

        if (isMounted && !didTimeout) setOffers(successful.flatMap((result) => result.value));
      } catch (loadError) {
        if (isMounted && !didTimeout) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "We couldn’t load your offers. Please try again."
          );
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (isMounted && !didTimeout) setIsLoading(false);
      }
    }

    void loadOffers();
    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-200">
      <header className="mx-auto max-w-2xl space-y-3 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Offers &amp; Discounts</span>
        </div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[#0B1020] sm:text-3xl">
          Offers for your subscriptions
        </h1>
        <p className="text-sm text-[#64748B]">
          Browse discounts that apply to subscriptions linked to your personal account.
        </p>
      </header>

      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-slate-500" role="status">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your offers...
        </div>
      ) : error ? (
        <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700" role="alert">
          {error}
        </div>
      ) : offers.length === 0 ? (
        <div className="mx-auto max-w-xl rounded-2xl border border-[#E8ECF3] bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Tag className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-heading text-lg font-bold text-[#0B1020]">No current offers</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#64748B]">
            There aren’t any active discounts for your current subscriptions right now. Check back later for new offers.
          </p>
          <Link
            href="/portal/subscriptions"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800"
          >
            View my subscriptions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => (
            <article
              key={`${offer.id}-${offer.subscription_id}`}
              className="flex flex-col rounded-2xl border border-[#E8ECF3] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  {offer.discount_type === "percentage" ? (
                    <BadgePercent className="h-5 w-5" />
                  ) : (
                    <CircleDollarSign className="h-5 w-5" />
                  )}
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  Active offer
                </span>
              </div>

              <h2 className="mt-5 font-heading text-lg font-bold text-[#0B1020]">{offer.name}</h2>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-violet-700">
                {offer.discount_type === "percentage"
                  ? `${Number(offer.value)}% off`
                  : `${formatCurrency(offer.value)} off`}
              </p>

              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm text-[#64748B]">
                <div className="flex items-start gap-2.5">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span>
                    <span className="block font-medium text-[#0B1020]">{offer.subscription_name}</span>
                    {offer.workspace_name} · {offer.subscription_number}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>{formatExpiry(offer.end_date)}</span>
                </div>
              </div>

              <div className="mt-auto pt-5">
                <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/60 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Offer code</p>
                  <p className="mt-1 select-all font-mono text-sm font-bold tracking-wide text-violet-800">{offer.code}</p>
                </div>
                {Number(offer.min_purchase_amount) > 0 && (
                  <p className="mt-3 text-xs text-slate-500">
                    Minimum purchase: {formatCurrency(offer.min_purchase_amount)}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
