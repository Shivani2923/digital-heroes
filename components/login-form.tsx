"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const supabase = createClient();

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        throw loginError;
      }

      if (!data.user) {
        throw new Error("Unable to retrieve user information.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw new Error("Unable to verify your account role.");
      }

      console.log("Logged-in email:", data.user.email);
      console.log("Profile role:", profile?.role);

      if (profile?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }

      router.refresh();
    } catch (error: unknown) {
      console.error("Login error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to login. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <Card className="overflow-hidden rounded-3xl border-0 bg-white/95 shadow-2xl shadow-emerald-950/10 backdrop-blur">
        {/* Header */}
        <CardHeader className="space-y-5 px-7 pb-6 pt-8 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-3xl shadow-lg shadow-emerald-500/25">
            ⛳
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Welcome back
            </p>

            <CardTitle className="text-3xl font-bold tracking-tight text-slate-950">
              Sign in to Digital
              <span className="text-emerald-600">Heroes</span>
            </CardTitle>

            <CardDescription className="text-sm leading-6 text-slate-500">
              Continue your journey, support meaningful causes, and take part
              in monthly rewards.
            </CardDescription>
          </div>
        </CardHeader>

        {/* Form */}
        <CardContent className="px-7 pb-8 sm:px-10">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-slate-700"
              >
                Email address
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm transition focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Password
                </Label>

                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-semibold text-emerald-600 transition hover:text-emerald-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm transition focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing you in...
                </span>
              ) : (
                "Sign in to your account →"
              )}
            </Button>

            {/* Divider */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>

              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400">
                  New to DigitalHeroes?
                </span>
              </div>
            </div>

            {/* Signup */}
            <Link
              href="/auth/sign-up"
              className="flex h-12 w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
            >
              Create a new account
            </Link>

            <p className="text-center text-xs leading-5 text-slate-400">
              By continuing, you agree to participate responsibly and support
              causes that matter.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}