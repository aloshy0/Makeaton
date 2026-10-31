"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Workspace, User, WorkspaceMembership } from "../types";
import { DUMMY_WORKSPACES, DUMMY_MEMBERSHIPS } from "../lib/dummy-data";
import { api } from "../lib/api";

export type FlowGridContextType = "PROFESSIONAL" | "PERSONAL";

interface PersonalCustomerProfile {
  name: string;
  email: string;
  hasCustomerRelationship: boolean;
  linkedBusinesses: Array<{
    workspace_id: string;
    workspace_name: string;
    subscriptions_count: number;
    unpaid_invoices_count: number;
  }>;
}

interface AccountContextValue {
  user: User | null;
  contextType: FlowGridContextType;
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  memberships: WorkspaceMembership[];
  personalCustomer: PersonalCustomerProfile;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ success: boolean; redirectUrl: string }>;
  switchContext: (type: FlowGridContextType, workspaceId?: string) => Promise<void>;
  switchWorkspace: (workspace: Workspace | string) => Promise<void>;
  createWorkspace: (data: {
    name: string;
    currency: string;
    timezone: string;
    description?: string;
  }) => Promise<Workspace>;
  logout: () => void;
  isLoading: boolean;
}

const DEFAULT_USER: User = {
  id: "usr-alexander",
  email: "demo@flowgrid.local",
  first_name: "Demo",
  last_name: "User",
  role: "ADMIN",
  is_active: true,
  owned_workspaces_count: 2,
  available_workspace_slots: 3,
  created_at: "2026-01-01T00:00:00Z",
};

const DEFAULT_PERSONAL_CUSTOMER: PersonalCustomerProfile = {
  name: "Alexander Wright",
  email: "demo@flowgrid.local",
  hasCustomerRelationship: true,
  linkedBusinesses: [
    {
      workspace_id: "aac3abe7-18b7-4c5f-a29e-786b63476459",
      workspace_name: "FlowGrid Cloud Technologies",
      subscriptions_count: 2,
      unpaid_invoices_count: 0,
    },
    {
      workspace_id: "22222222-2222-2222-2222-222222222222",
      workspace_name: "FlowGrid Hardware Labs",
      subscriptions_count: 1,
      unpaid_invoices_count: 1,
    },
  ],
};

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(DUMMY_WORKSPACES);
  const [memberships] = useState<WorkspaceMembership[]>(DUMMY_MEMBERSHIPS);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(DUMMY_WORKSPACES[0]);
  const [contextType, setContextType] = useState<FlowGridContextType>(() => {
    if (typeof window !== "undefined" && pathname?.startsWith("/portal")) {
      return "PERSONAL";
    }
    return "PROFESSIONAL";
  });
  const [personalCustomer] = useState<PersonalCustomerProfile>(DEFAULT_PERSONAL_CUSTOMER);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  // Sync route with context
  useEffect(() => {
    if (pathname?.startsWith("/portal") && contextType !== "PERSONAL") {
      setContextType("PERSONAL");
    } else if (
      !pathname?.startsWith("/portal") &&
      pathname !== "/" &&
      !pathname?.startsWith("/login") &&
      !pathname?.startsWith("/register") &&
      !pathname?.startsWith("/workspaces") &&
      contextType !== "PROFESSIONAL"
    ) {
      setContextType("PROFESSIONAL");
    }
  }, [pathname, contextType]);

  const login = async ({ email, password }: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.access && typeof window !== "undefined") {
        localStorage.setItem("access_token", res.access);
      }
      if (res.user) {
        setUser(res.user);
      }
      if (res.workspaces && res.workspaces.length > 0) {
        setWorkspaces(res.workspaces);
        setActiveWorkspace(res.workspaces[0]);
      }

      const isCustomer =
        email.toLowerCase().includes("customer") ||
        email.toLowerCase().includes("globex") ||
        res.user?.role === "CUSTOMER";

      if (isCustomer) {
        setContextType("PERSONAL");
        router.push("/portal");
        return { success: true, redirectUrl: "/portal" };
      } else {
        setContextType("PROFESSIONAL");
        router.push("/dashboard");
        return { success: true, redirectUrl: "/dashboard" };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchContext = async (type: FlowGridContextType, targetWorkspaceId?: string) => {
    setIsLoading(true);
    try {
      if (type === "PERSONAL") {
        setContextType("PERSONAL");
        try {
          await api.setActiveContext({
            context_type: "PERSONAL_CUSTOMER",
            workspace_id: activeWorkspace?.id,
          });
        } catch {
          // Graceful fallback
        }
        router.push("/portal");
      } else {
        setContextType("PROFESSIONAL");
        const nextWorkspace = targetWorkspaceId
          ? workspaces.find((w) => w.id === targetWorkspaceId) || workspaces[0]
          : activeWorkspace || workspaces[0];

        setActiveWorkspace(nextWorkspace);

        try {
          await api.setActiveContext({
            context_type: "BUSINESS",
            workspace_id: nextWorkspace?.id,
          });
        } catch {
          // Graceful fallback
        }
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchWorkspace = async (target: Workspace | string) => {
    const ws = typeof target === "string" ? workspaces.find((w) => w.id === target) : target;
    if (!ws) return;

    setIsLoading(true);
    try {
      setActiveWorkspace(ws);
      setContextType("PROFESSIONAL");
      try {
        await api.setActiveContext({
          context_type: "BUSINESS",
          workspace_id: ws.id,
        });
      } catch {
        // Graceful fallback
      }
      if (pathname === "/portal" || pathname === "/workspaces") {
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkspace = async (data: {
    name: string;
    currency: string;
    timezone: string;
    description?: string;
  }): Promise<Workspace> => {
    setIsLoading(true);
    try {
      let created: Workspace;
      try {
        created = await api.createWorkspace({
          name: data.name,
          currency: data.currency,
          timezone: data.timezone,
        });
        created.user_role = "OWNER";
        created.description = data.description;
        created.last_accessed = "Just now";
      } catch {
        created = {
          id: `ws-${Date.now()}`,
          name: data.name,
          slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          currency: data.currency,
          timezone: data.timezone,
          description: data.description || "Production workspace on FlowGrid.",
          is_active: true,
          user_role: "OWNER",
          active_members_count: 1,
          last_accessed: "Just now",
          created_at: new Date().toISOString(),
        };
      }

      setWorkspaces((prev) => [created, ...prev]);
      setActiveWorkspace(created);
      setContextType("PROFESSIONAL");
      return created;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
    setUser(null);
    router.push("/login");
  };

  return (
    <AccountContext.Provider
      value={{
        user,
        contextType,
        activeWorkspace,
        workspaces,
        memberships,
        personalCustomer,
        isSidebarCollapsed,
        toggleSidebar,
        login,
        switchContext,
        switchWorkspace,
        createWorkspace,
        logout,
        isLoading,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}
