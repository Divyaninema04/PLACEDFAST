import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { authService } from "@/services/auth.service";
import { apiRequest, setAuthToken } from "@/services/api";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — PlacementPilot" },
      { name: "description", content: "Sign in or create an account for PlacementPilot." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  // Handle incoming OAuth callback tokens or errors in URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (token) {
      setAuthToken(token);
      authService
        .getMe()
        .then(() => {
          toast.success("Google authentication successful! Welcome to PlacementPilot.");
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate({ to: "/dashboard" });
        })
        .catch(() => {
          navigate({ to: "/dashboard" });
        });
    } else if (error) {
      toast.error(`Google authentication error: ${decodeURIComponent(error)}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.login({ email, password });
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.register({ email, password, fullName });
      toast.success("Account created successfully!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      // 1. Request OAuth consent URL from backend
      const res = await apiRequest<{ success: boolean; url?: string }>("/api/auth/google/url");

      if (res?.url) {
        console.log("[Google OAuth] Redirecting to Google consent screen:", res.url);
        window.location.href = res.url;
        return;
      }

      toast.info("Entering session with Google Account (Demo Mode)");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      console.warn("[Google OAuth Warning]:", err?.message || err);
      toast.info(
        "Google OAuth credentials not configured in backend/.env. Entering in Demo Mode. (See NEXT-STEPS.md)",
      );
      navigate({ to: "/dashboard" });
    } finally {
      setBusy(false);
    }
  };

  const handleInstantAccess = () => {
    const studentUser = {
      id: "student-local",
      email: "student@placementpilot.edu",
      fullName: "Student",
      role: "student",
      skills: [],
    };
    localStorage.setItem("placementpilot_user", JSON.stringify(studentUser));
    toast.success("Welcome to PlacementPilot!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="gradient-mesh min-h-screen">
      <div className="mx-auto flex max-w-md flex-col px-6 py-10">
        <Link to="/" className="flex items-center gap-2 self-start">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Rocket className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">PlacementPilot</span>
        </Link>

        <div className="bento-card mt-8">
          <h1 className="font-display text-2xl font-bold tracking-tight">Welcome</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in or explore the full platform instantly in demo mode.
          </p>

          <Button
            className="mt-6 w-full gap-2 shadow-md"
            onClick={handleInstantAccess}
          >
            ⚡ Enter Dashboard (Instant Access / Demo Mode)
          </Button>

          <Button
            variant="outline"
            className="mt-2 w-full gap-2"
            onClick={handleGoogle}
            disabled={busy}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-muted-foreground">or with email</span>
            </div>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form className="space-y-3" onSubmit={handleSignIn}>
                <div className="space-y-1.5">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="si-pass">Password</Label>
                  <Input id="si-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>Sign in</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form className="space-y-3" onSubmit={handleSignUp}>
                <div className="space-y-1.5">
                  <Label htmlFor="su-name">Full name</Label>
                  <Input id="su-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="su-pass">Password</Label>
                  <Input id="su-pass" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>Create account</Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}