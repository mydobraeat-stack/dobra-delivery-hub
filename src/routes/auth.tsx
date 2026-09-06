import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DobraLogo } from "@/components/dobra/Logo";

const searchSchema = z.object({
  mode: z.enum(["signup", "login"]).catch("login"),
  role: z.enum(["customer", "vendor", "driver"]).catch("customer"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in to Dobra — Food delivery" },
      {
        name: "description",
        content:
          "Create a Dobra account or log in as a customer, restaurant, or delivery driver.",
      },
      { property: "og:title", content: "Sign in to Dobra" },
      {
        property: "og:description",
        content: "Create a Dobra account or log in as a customer, restaurant, or driver.",
      },
    ],
  }),
  component: AuthPage,
});

const roleLabels = {
  customer: "Customer",
  vendor: "Vendor",
  driver: "Driver",
} as const;

function AuthPage() {
  const { mode, role } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/home", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (isSignup) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { role, full_name: fullName, country },
        },
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (!data.session) {
        setMessage("Almost there — check your email to confirm your account.");
        return;
      }
      navigate({ to: "/home", replace: true });
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate({ to: "/home", replace: true });
  }

  async function handleGoogle() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in didn't work. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/home", replace: true });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-12">
      <Link to="/" className="mb-6">
        <DobraLogo className="text-5xl" />
      </Link>

      <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-soft sm:p-8">
        <h1 className="text-2xl font-bold text-foreground">
          {isSignup ? `Sign up as a ${roleLabels[role]}` : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          {isSignup
            ? "Create your Dobra account in a few seconds."
            : "Log in to continue ordering, cooking or delivering."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isSignup ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  autoComplete="country-name"
                />
              </div>
            </>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pr-10"
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-foreground/50 hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-foreground/70">{message}</p> : null}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-foreground/40">
          <span className="h-px flex-1 bg-ink/10" />
          or
          <span className="h-px flex-1 bg-ink/10" />
        </div>

        <Button variant="outline" className="w-full" size="lg" onClick={handleGoogle}>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-foreground/60">
          {isSignup ? "Already have an account?" : "New to Dobra?"}{" "}
          <Link
            to="/auth"
            search={{ mode: isSignup ? "login" : "signup", role }}
            className="font-semibold text-brand underline-offset-4 hover:underline"
          >
            {isSignup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </div>
    </main>
  );
}
