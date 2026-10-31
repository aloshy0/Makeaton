import * as React from "react";
import { cn } from "../../lib/utils";

export type BadgeVariant =
  | "active"
  | "confirmed"
  | "quotation"
  | "draft"
  | "paused"
  | "closed"
  | "cancelled"
  | "overdue"
  | "paid"
  | "outline";

const variantStyles: Record<BadgeVariant, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200/80",
  quotation: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
  draft: "bg-slate-100 text-slate-700 border-slate-200/80",
  paused: "bg-amber-50 text-amber-700 border-amber-200/80",
  closed: "bg-slate-100 text-slate-600 border-slate-200/80",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200/80",
  overdue: "bg-rose-50 text-rose-700 border-rose-200/80",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  outline: "text-slate-700 border-slate-200 bg-transparent",
};

const dotColors: Record<BadgeVariant, string> = {
  active: "bg-emerald-500",
  paid: "bg-emerald-500",
  confirmed: "bg-blue-500",
  quotation: "bg-indigo-500",
  draft: "bg-slate-400",
  paused: "bg-amber-500",
  closed: "bg-slate-400",
  cancelled: "bg-slate-400",
  overdue: "bg-rose-500",
  outline: "bg-slate-400",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  withDot?: boolean;
}

export function Badge({ className, variant = "draft", withDot = true, children, ...props }: BadgeProps) {
  const currentVariant = variant || "draft";
  const styles = variantStyles[currentVariant] || variantStyles.draft;
  const dotColor = dotColors[currentVariant] || dotColors.draft;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors",
        styles,
        className
      )}
      {...props}
    >
      {withDot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)} />}
      <span className="capitalize">{children}</span>
    </div>
  );
}
