"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Stats = {
  totalUsers: number;
  activeDraws: number;
  pendingWinners: number;
  charityContributions: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeDraws: 0,
    pendingWinners: 0,
    charityContributions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const adminModules = [
    {
      title: "User Management",
      description: "View and manage registered users.",
      href: "/admin/users",
      icon: "👥",
    },
    {
      title: "Draw Management",
      description: "Create draws, run simulations, and publish results.",
      href: "/admin/draws",
      icon: "🎲",
    },
    {
      title: "Charity Management",
      description: "Add, edit, and manage charities.",
      href: "/admin/charities",
      icon: "❤️",
    },
    {
      title: "Winner Verification",
      description: "Review winner proof and approve or reject claims.",
      href: "/admin/winners",
      icon: "🏆",
    },
    {
      title: "Reports & Analytics",
      description:
        "View users, prize pools, donations, and draw statistics.",
      href: "/admin/reports",
      icon: "📊",
    },
  ];

  useEffect(() => {
    async function verifyAdminAndFetchStats() {
      try {
        setLoading(true);
        setError("");

        // Check whether the logged-in user is an admin
        const adminResponse = await fetch("/api/auth/check-admin");

        const adminData = await adminResponse.json();

        if (!adminResponse.ok || !adminData.isAdmin) {
          router.replace("/dashboard");
          return;
        }

        // 1. Total registered users
        const { count: totalUsers, error: usersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        if (usersError) {
          throw usersError;
        }

        // 2. Active draws
        const { count: activeDraws, error: drawsError } = await supabase
          .from("draws")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        if (drawsError) {
          throw drawsError;
        }

        // 3. Pending winners
        const { count: pendingWinners, error: winnersError } =
          await supabase
            .from("draw_winners")
            .select("*", { count: "exact", head: true })
            .eq("verification_status", "pending");

        if (winnersError) {
          throw winnersError;
        }

        // 4. Charity preferences
        const {
          count: charityContributions,
          error: charityError,
        } = await supabase
          .from("user_charities")
          .select("*", { count: "exact", head: true });

        if (charityError) {
          throw charityError;
        }

        setStats({
          totalUsers: totalUsers ?? 0,
          activeDraws: activeDraws ?? 0,
          pendingWinners: pendingWinners ?? 0,
          charityContributions: charityContributions ?? 0,
        });
      } catch (err: unknown) {
        console.error("Error loading dashboard statistics:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard statistics"
        );
      } finally {
        setLoading(false);
      }
    }

    verifyAdminAndFetchStats();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Digital Heroes
            </p>

            <h1 className="text-4xl font-bold text-slate-900">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Manage users, draws, charities, winners, and platform reports.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg bg-slate-900 px-5 py-3 text-center font-semibold text-white transition hover:bg-slate-700"
          >
            Back to User Dashboard
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">👥</div>

            <p className="text-sm text-slate-500">Total Users</p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : stats.totalUsers}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Registered platform users
            </p>
          </div>

          {/* Active Draws */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">🎟️</div>

            <p className="text-sm text-slate-500">Active Draws</p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : stats.activeDraws}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Currently active draws
            </p>
          </div>

          {/* Pending Winners */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">🏆</div>

            <p className="text-sm text-slate-500">Pending Winners</p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : stats.pendingWinners}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Awaiting verification
            </p>
          </div>

          {/* Charity Contributions */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-4xl">❤️</div>

            <p className="text-sm text-slate-500">
              Charity Contributions
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : stats.charityContributions}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Recorded charity preferences
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            Failed to load dashboard statistics: {error}
          </div>
        )}

        {/* Admin Modules */}
        <h2 className="mb-5 text-2xl font-bold text-slate-900">
          Management Modules
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminModules.map((module) => (
            <Link
              key={module.title}
              href={module.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 text-4xl">{module.icon}</div>

              <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600">
                {module.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {module.description}
              </p>

              <p className="mt-5 font-semibold text-emerald-600">
                Open Module →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}