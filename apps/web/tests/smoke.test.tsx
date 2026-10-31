import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Badge } from "../src/components/ui/badge";
import { StatCard } from "../src/components/ui/stat-card";
import { formatCurrency, formatDate } from "../src/lib/utils";

describe("Frontend Foundation & UI Components Smoke Test", () => {
  it("renders semantic status badges correctly", () => {
    render(<Badge variant="active">Active Plan</Badge>);
    expect(screen.getByText("Active Plan")).toBeInTheDocument();
  });

  it("renders overdue badge correctly", () => {
    render(<Badge variant="overdue">Overdue</Badge>);
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("renders Financial KPI StatCard with tabular values", () => {
    render(
      <StatCard title="Monthly Recurring Revenue" value="$18,450.00" subtitle="ARR: $221,400.00" />
    );
    expect(screen.getByText("Monthly Recurring Revenue")).toBeInTheDocument();
    expect(screen.getByText("$18,450.00")).toBeInTheDocument();
    expect(screen.getByText("ARR: $221,400.00")).toBeInTheDocument();
  });

  it("formats currencies and dates correctly", () => {
    expect(formatCurrency(1250.5)).toBe("$1,250.50");
    expect(formatCurrency(0)).toBe("$0.00");
    expect(formatDate("2026-10-31")).toContain("2026");
  });
});
