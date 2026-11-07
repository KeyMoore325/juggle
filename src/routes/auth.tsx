import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";
import { useAccountAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/og-pages";
export const Route = createFileRoute("/auth")({
  head: () => pageHead("auth"),
  component: AuthPage,
});
function AuthPage() {
  const navigate = useNavigate(); const { user } = useAccountAuth();
  return <main className="mx-auto min-h-screen max-w-lg px-5 py-8"><Link to="/" className="font-display text-3xl font-bold">juggle<span className="text-primary">.</span></Link>
    <h1 className="mb-6 mt-12 text-4xl font-bold">Your little corner of Juggle</h1>
    {user ? <Button asChild><Link to="/dashboard">My schedules</Link></Button> : <AuthForm onSuccess={() => { void navigate({ to: "/dashboard" }); }} />}
    <Button asChild variant="link" className="mt-6"><Link to="/quiz">Back to the quiz</Link></Button>
  </main>;
}