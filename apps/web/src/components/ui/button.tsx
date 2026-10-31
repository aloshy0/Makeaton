import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  primary:
    "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border border-transparent font-medium",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-transparent font-medium",
  outline:
    "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm font-medium",
  ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
  danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm font-medium",
};

const sizeStyles = {
  sm: "px-2.5 py-1.5 text-xs rounded-md",
  md: "px-3.5 py-2 text-sm rounded-lg",
  lg: "px-4.5 py-2.5 text-base rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
