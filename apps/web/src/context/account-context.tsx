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
    business_type?: string;
    business_email?: string;
    phone?: string;
    address?: string;
    logo_url?: string;
    description?: string;
  }) => Promise<Workspace>;
  setAuthenticatedAccount: (user: User, workspaces: Workspace[], type: FlowGridContextType) => void;
  refreshWorkspaces: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_USER: User = {
  id: "usr-alexander",
  email: "alexander.wright@flowgrid.com",
  first_name: "Alexander",
  last_name: "Wright",
  role: "ADMIN",
  is_active: true,
  owned_workspaces_count: 2,
  available_workspace_slots: 3,
  created_at: "2026-01-01T00:00:00Z",
};

const DEFAULT_PERSONAL_CUSTOMER: PersonalCustomerProfile = {
  name: "Alexander Wright",
  email: "alexander.wright@flowgrid.com",
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
      workspace_name: "FlowGrid Creative Studio",
      subscriptions_count: 1,
      unpaid_invoices_count: 1,
    },
  ],
};

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("access_token")) {
      return {
        id: "usr-aloshy",
        email: "aloshy@flowgrid.com",
        first_name: "Aloshy",
        last_name: "Antony",
        role: "CUSTOMER",
        is_active: true,
        owned_workspaces_count: 0,
        available_workspace_slots: 0,
        created_at: "2026-01-01T00:00:00Z",
      };
    }
    return DEFAULT_USER;
  });
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("access_token")) {
      return [];
    }
    return DUMMY_WORKSPACES;
  });
  const [memberships] = useState<WorkspaceMembership[]>(DUMMY_MEMBERSHIPS);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("access_token")) {
      return null;
    }
    return DUMMY_WORKSPACES[0];
  });
  const [contextType, setContextType] = useState<FlowGridContextType>("PERSONAL");
  const [personalCustomer] = useState<PersonalCustomerProfile>(DEFAULT_PERSONAL_CUSTOMER);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await api.login(credentials);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("access_token", response.access);
      }
      const hasBusinessAccess = response.workspaces.some(
        (workspace) => workspace.user_role !== "CUSTOMER"
      );
      const type = hasBusinessAccess ? "PROFESSIONAL" : "PERSONAL";
      setAuthenticatedAccount(response.user, response.workspaces, type);
      const redirectUrl = hasBusinessAccess ? "/dashboard" : "/portal";
      router.push(redirectUrl);
      return { success: true, redirectUrl };
    } catch {
      const redirectUrl = "/login";
      router.push(redirectUrl);
      return { success: false, redirectUrl };
    } finally {
      setIsLoading(false);
    }
  };

  const setAuthenticatedAccount = (
    authenticatedUser: User,
    authenticatedWorkspaces: Workspace[],
    type: FlowGridContextType
  ) => {
    setUser(authenticatedUser);
    setWorkspaces(authenticatedWorkspaces);
    setActiveWorkspace(authenticatedWorkspaces[0] ?? null);
    setContextType(type);
  };

  // Sync route with context
  useEffect(() => {
    if (pathname?.startsWith("/portal") && contextType !== "PERSONAL") {
      setContextType("PERSONAL");
    } else if (
      !pathname?.startsWith("/portal") &&
      !pathname?.startsWith("/login") &&
      !pathname?.startsWith("/register") &&
      !pathname?.startsWith("/checkout") &&
      pathname !== "/" &&
      contextType !== "PROFESSIONAL"
    ) {
      setContextType("PROFESSIONAL");
    }
  }, [pathname, contextType]);

  const switchContext = async (type: FlowGridContextType, targetWorkspaceId?: string) => {
    setIsLoading(true);
    try {
      if (type === "PERSONAL") {
        setContextType("PERSONAL");
        // Try backend active-context switch
        try {
          await api.setActiveContext({
            context_type: "PERSONAL_CUSTOMER",
            workspace_id: activeWorkspace?.id,
          });
        } catch {
          // Fallback graceful
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
            workspace_id: nextWorkspace.id,
          });
        } catch {
          // Fallback graceful
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
        // Fallback graceful
      }
      if (pathname === "/portal" || pathname === "/workspaces") {
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWorkspaces = async () => {
    try {
      const res = await api.getWorkspaces();
      if (Array.isArray(res)) {
        setWorkspaces(res);
        setActiveWorkspace((prev) => {
          if (res.length === 0) return null;
          const match = res.find((w) => w.id === prev?.id);
          return match || res[0];
        });
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("access_token")) {
      refreshWorkspaces();
      api
        .getMe()
        .then((me) => {
          if (me && me.id) setUser(me);
        })
        .catch(() => {});
    }
  }, []);

  const createWorkspace = async (data: {
    name: string;
    currency: string;
    timezone: string;
    business_type?: string;
    business_email?: string;
    phone?: string;
    address?: string;
    logo_url?: string;
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
          business_type: data.business_type,
          business_email: data.business_email,
          phone: data.phone,
          address: data.address,
          logo_url: data.logo_url,
        });
        created.user_role = "OWNER";
        created.description = data.description;
        created.last_accessed = "Just now";
      } catch {
        // Generate client-side workspace if offline
        created = {
          id: `ws-${Date.now()}`,
          name: data.name,
          slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          currency: data.currency,
          timezone: data.timezone,
          business_type: data.business_type || "SaaS & Cloud",
          business_email: data.business_email,
          phone: data.phone,
          address: data.address,
          logo_url: data.logo_url,
          description: data.description || "Production workspace on FlowGrid.",
          is_active: true,
          user_role: "OWNER",
          active_members_count: 1,
          last_accessed: "Just now",
          created_at: new Date().toISOString(),
        };
      }

      setWorkspaces((prev) => [created, ...prev.filter((w) => w.id !== created.id)]);
      setActiveWorkspace(created);
      setContextType("PROFESSIONAL");
      return created;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Clear the local FlowGrid session even if the API is offline.
    } finally {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("access_token");
      }
      setUser(null);
      router.push("/login");
    }
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
        setAuthenticatedAccount,
        refreshWorkspaces,
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
