"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { ApiError, apiFetch } from "./api-client";
import type { Role } from "./constants";

/** Shape of GET /api/v1/auth/me (see docs/API.md). */
export interface Me {
  id: string;
  name: string;
  email: string;
  mobile: string;
  roles: Role[];
  status: "active" | "blocked";
  publicCode: string | null;
  business: {
    name: string | null; type: string | null; categories: string[]; address: string | null; city: string | null;
    state: string | null; pincode: string | null; gstNumber: string | null; yearsInBusiness: number | null;
  } | null;
  lastLoginAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

type MeState = {
  me: Me | null;
  loading: boolean;
  setMe: (me: Me | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const MeContext = createContext<MeState>({
  me: null, loading: true, setMe: () => {}, refresh: async () => {}, logout: async () => {},
});

export const isAdminRole = (roles: readonly string[] = []) => roles.includes("admin") || roles.includes("superadmin");
export const homeFor = (roles: readonly string[] = []) => (isAdminRole(roles) ? "/admin" : "/dashboard");

/** The logged-in user for the whole site (header, dashboard shell, admin shell). */
export function MeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setMe(await apiFetch<Me>("/auth/me"));
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    setMe(null);
    router.replace("/login");
    router.refresh();
  }, [router]);

  return <MeContext.Provider value={{ me, loading, setMe, refresh, logout }}>{children}</MeContext.Provider>;
}

export const useMe = () => useContext(MeContext);
