import { Link } from "@tanstack/react-router";
import { LogOut, UserRound, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAccountAuth } from "./auth-provider";
export function AccountMenu() {
  const { user, loading, signOut } = useAccountAuth();
  if (loading) return <span className="h-9 w-20" aria-label="Loading account" />;
  if (!user) return <Button asChild variant="outline"><Link to="/auth"><UserRound />Sign in</Link></Button>;
  return <nav aria-label="Account" className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link to="/dashboard"><CalendarDays /><span className="hidden sm:inline">My schedules</span></Link></Button><Button asChild variant="outline" size="icon" title="Profile and preferences"><Link to="/profile" aria-label="Profile and preferences"><UserRound /></Link></Button><Button size="icon" variant="ghost" aria-label="Sign out" title="Sign out" onClick={() => { void signOut().catch((e: unknown) => toast.error(e instanceof Error ? e.message : "Couldn't sign out.")); }}><LogOut /></Button></nav>;
}