"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Calendar,
  CreditCard,
  Tag,
  AlertCircle,
  Check,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "renewal" | "payment" | "offer" | "system";
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Upcoming Subscription Renewal",
    message: "Your Notion Pro plan is renewing on Nov 15, 2026 for ₹899/mo. Ensure your payment method is active.",
    timestamp: "2 hours ago",
    type: "renewal",
    unread: true,
  },
  {
    id: "notif-2",
    title: "Payment Successful",
    message: "Payment of ₹899 for Notion Pro (Monthly) was successfully processed on Oct 03, 2026.",
    timestamp: "Oct 03, 2026",
    type: "payment",
    unread: false,
  },
  {
    id: "notif-3",
    title: "Special Offer Available",
    message: "Get 20% off on all annual plans this month! Apply code ANNUAL20 before Oct 31, 2026.",
    timestamp: "1 day ago",
    type: "offer",
    unread: true,
  },
  {
    id: "notif-4",
    title: "Payment Successful",
    message: "Payment of ₹1,200 for Figma Professional was successfully processed on Sep 20, 2026.",
    timestamp: "Sep 20, 2026",
    type: "payment",
    unread: false,
  },
];

export default function PortalNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "renewal":
        return <Calendar className="w-5 h-5 text-amber-500" />;
      case "payment":
        return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case "offer":
        return <Tag className="w-5 h-5 text-[#7651F5]" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8ECF3]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#0B1020]">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-[#7651F5] text-white hover:bg-[#6842e4] text-xs font-semibold px-2 py-0.5">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated with your subscription renewals, payment confirmations, and special offers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-9 border-[#E8ECF3] text-slate-700 hover:bg-slate-50 gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs h-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="border-[#E8ECF3] bg-white rounded-2xl p-12 text-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#0B1020]">No notifications</h3>
            <p className="text-xs text-slate-500 mt-1">
              You are all caught up! New notifications regarding renewals and receipts will appear here.
            </p>
          </Card>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                item.unread
                  ? "bg-purple-50/40 border-[#7651F5]/20 shadow-2xs hover:border-[#7651F5]/40"
                  : "bg-white border-[#E8ECF3] hover:border-slate-300"
              }`}
            >
              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-[#0B1020] truncate">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 shrink-0">{item.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
              </div>
              {item.unread && (
                <div className="h-2 w-2 rounded-full bg-[#7651F5] shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
