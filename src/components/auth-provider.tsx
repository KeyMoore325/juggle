import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Auth = { user: User | null; loading: boolean; signOut: () => Promise<void> };
const AuthContext = createContext<Auth>({ user: null, loading: true, signOut: async () => {} });
export const useAccountAuth = () => useContext(AuthContext);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(), navigate = useNavigate(), queryClient = useQueryClient();
  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => { if (active) { setUser(data.user); setLoading(false); } });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setUser(session?.user ?? null); setLoading(false);
      if (event === "SIGNED_OUT") { queryClient.clear(); }
      void router.invalidate();
      if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [router, queryClient]);
  const signOut = async () => {
    await queryClient.cancelQueries(); queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    await navigate({ to: "/auth", replace: true });
  };
  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
}