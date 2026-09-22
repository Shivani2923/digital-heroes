"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Heart, ShieldCheck, Trophy } from "lucide-react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const supabase = createClient();

    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "grid min-h-[680px] w-full overflow-hidden rounded-3xl border bg-white shadow-2xl lg:grid-cols-2",
        className
      )}
      {...props}
    >
      {/* Left Branding Section */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-600 p-10 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-teal-300/20 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Trophy className="h-6 w-6" />
            </div>

            <span className="text-2xl font-bold tracking-tight">
              Digital Heroes
            </span>
          </div>

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-200">
            Play with purpose
          </p>

          <h1 className="max-w-md text-4xl font-bold leading-tight">
            Every score can make a difference.
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-emerald-100">
            Join a community where your passion for golf helps support
            meaningful charity initiatives.
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-2">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Support meaningful causes</p>
              <p className="text-sm text-emerald-100">
                Turn participation into positive impact.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-2">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Your journey starts here</p>
              <p className="text-sm text-emerald-100">
                Create your account and explore the platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Section */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 lg:hidden">
              <Trophy className="h-6 w-6" />
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-600">
              Get started
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Create your account
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Join Digital Heroes and start playing with purpose.
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Email address
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus-visible:ring-emerald-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Password
              </Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 pr-12 focus-visible:ring-emerald-600"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-700"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Use at least 6 characters.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repeat-password" className="text-slate-700">
                Confirm password
              </Label>

              <div className="relative">
                <Input
                  id="repeat-password"
                  type={showRepeatPassword ? "text" : "password"}
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 pr-12 focus-visible:ring-emerald-600"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowRepeatPassword(!showRepeatPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-700"
                  aria-label="Toggle confirm password visibility"
                >
                  {showRepeatPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-emerald-700 text-base font-semibold text-white transition hover:bg-emerald-800"
            >
              {isLoading ? "Creating your account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-emerald-700 underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            By creating an account, you agree to use Digital Heroes
            responsibly and support our community values.
          </p>
        </div>
      </div>
    </div>
  );
}