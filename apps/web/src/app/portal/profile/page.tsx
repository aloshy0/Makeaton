"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Building,
  MapPin,
  Lock,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  Briefcase,
  Smartphone,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { useAccount } from "../../../context/account-context";

export default function CustomerPortalProfilePage() {
  const { user, memberships, switchContext, switchWorkspace } = useAccount();

  const [firstName, setFirstName] = useState(user?.first_name || "Alexander");
  const [lastName, setLastName] = useState(user?.last_name || "Vance");
  const [email, setEmail] = useState(user?.email || "alexander.vance@example.com");
  const [company, setCompany] = useState("Vance Design Group");
  const [taxId, setTaxId] = useState("US-98-7654321");
  const [address, setAddress] = useState("742 Evergreen Terrace, Suite 400");
  const [city, setCity] = useState("San Francisco");
  const [state, setState] = useState("CA");
  const [postalCode, setPostalCode] = useState("94107");
  const [country, setCountry] = useState("United States");

  const [emailReceipts, setEmailReceipts] = useState(true);
  const [renewalReminders, setRenewalReminders] = useState(true);
  const [productAnnouncements, setProductAnnouncements] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Account Preferences
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-[#64748B]">Personal Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#0B1020] tracking-tight">
            Customer Profile & Security
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Manage your personal identity, billing contact details, and account security
            preferences.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-1.5 border border-emerald-200 text-xs font-semibold text-emerald-700 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4" /> Changes saved successfully
          </div>
        )}
      </div>

      {/* Switch to Business Workspace callout if user has memberships */}
      {memberships.length > 0 && (
        <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-blue-50/60 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-[#0B1020]">
                Access Business Workspaces
              </h4>
              <p className="text-xs text-[#64748B] mt-0.5">
                You belong to {memberships.length} professional workspace
                {memberships.length > 1 ? "s" : ""}. Switch context anytime without logging out.
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              switchContext("PROFESSIONAL");
              if (memberships[0]?.workspace_details) {
                switchWorkspace(memberships[0].workspace_details);
              }
            }}
            className="bg-[#0B1020] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold gap-1.5 h-9 shrink-0"
          >
            Switch to Professional <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Profile & Billing Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <Card className="rounded-2xl border-[#E8ECF3] shadow-2xs overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-[#E8ECF3] px-6 py-4">
            <CardTitle className="text-base font-heading font-bold text-[#0B1020] flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" /> Personal Identity
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Primary details associated with your subscriber account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0B1020]">First Name</Label>
                <Input
                  value={firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFirstName(e.target.value)
                  }
                  className="rounded-xl border-[#E8ECF3] text-xs h-9"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0B1020]">Last Name</Label>
                <Input
                  value={lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                  className="rounded-xl border-[#E8ECF3] text-xs h-9"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0B1020]">Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="rounded-xl border-[#E8ECF3] text-xs h-9"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0B1020]">
                  Company / Entity (Optional)
                </Label>
                <Input
                  value={company}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
                  className="rounded-xl border-[#E8ECF3] text-xs h-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Address Card */}
        <Card className="rounded-2xl border-[#E8ECF3] shadow-2xs overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-[#E8ECF3] px-6 py-4">
            <CardTitle className="text-base font-heading font-bold text-[#0B1020] flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" /> Billing Information & Tax ID
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Address printed on tax-compliant subscription invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#0B1020]">Street Address</Label>
              <Input
                value={address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                className="rounded-xl border-[#E8ECF3] text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0B1020]">City</Label>
                <Input
                  value={city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                  className="rounded-xl border-[#E8ECF3] text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0B1020]">State / Province</Label>
                <Input
                  value={state}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setState(e.target.value)}
                  className="rounded-xl border-[#E8ECF3] text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0B1020]">Postal / ZIP Code</Label>
                <Input
                  value={postalCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPostalCode(e.target.value)
                  }
                  className="rounded-xl border-[#E8ECF3] text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0B1020]">Country</Label>
                <Input
                  value={country}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCountry(e.target.value)}
                  className="rounded-xl border-[#E8ECF3] text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#0B1020]">
                  Tax Identification (VAT / EIN / GST)
                </Label>
                <Input
                  value={taxId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTaxId(e.target.value)}
                  placeholder="e.g. US-12-3456789"
                  className="rounded-xl border-[#E8ECF3] text-xs h-9 font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="rounded-2xl border-[#E8ECF3] shadow-2xs overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-[#E8ECF3] px-6 py-4">
            <CardTitle className="text-base font-heading font-bold text-[#0B1020] flex items-center gap-2">
              <Bell className="h-4 w-4 text-purple-600" /> Notification Preferences
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Configure which email notifications you receive from FlowGrid
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-[#E8ECF3]">
              <div>
                <p className="text-xs font-semibold text-[#0B1020]">Payment Receipts & Invoices</p>
                <p className="text-[11px] text-[#64748B]">
                  Receive PDF receipts upon automated settlement
                </p>
              </div>
              <input
                type="checkbox"
                aria-label="Toggle payment receipts"
                checked={emailReceipts}
                onChange={(e) => setEmailReceipts(e.target.checked)}
                className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E8ECF3]">
              <div>
                <p className="text-xs font-semibold text-[#0B1020]">Upcoming Renewal Warnings</p>
                <p className="text-[11px] text-[#64748B]">
                  Advance notification 7 days prior to card charge
                </p>
              </div>
              <input
                type="checkbox"
                aria-label="Toggle upcoming renewal warnings"
                checked={renewalReminders}
                onChange={(e) => setRenewalReminders(e.target.checked)}
                className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-semibold text-[#0B1020]">
                  Product Updates & Feature Notes
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Monthly digest of new features in FlowGrid
                </p>
              </div>
              <input
                type="checkbox"
                aria-label="Toggle product updates"
                checked={productAnnouncements}
                onChange={(e) => setProductAnnouncements(e.target.checked)}
                className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Authentication */}
        <Card className="rounded-2xl border-[#E8ECF3] shadow-2xs overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-[#E8ECF3] px-6 py-4">
            <CardTitle className="text-base font-heading font-bold text-[#0B1020] flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" /> Account Security & Credentials
            </CardTitle>
            <CardDescription className="text-xs text-[#64748B]">
              Multi-factor authentication and session management
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-[#E8ECF3] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0B1020]">Account Password</p>
                  <p className="text-[11px] text-[#64748B]">Last changed 3 months ago</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="rounded-xl border-[#E8ECF3] text-xs h-8"
              >
                Update Password
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 pt-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-[#0B1020]">
                      Two-Factor Authentication (2FA)
                    </p>
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px] py-0">
                      Enabled
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#64748B]">Authenticator App (TOTP) active</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="rounded-xl border-[#E8ECF3] text-xs h-8 text-[#DC5555] hover:text-[#DC5555]"
              >
                Reconfigure
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Save Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold h-10 px-6 gap-1.5 shadow-sm"
          >
            <Save className="h-4 w-4" /> Save Profile Details
          </Button>
        </div>
      </form>
    </div>
  );
}
