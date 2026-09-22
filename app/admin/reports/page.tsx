"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Analytics = {
  totalUsers: number;
  totalDraws: number;
  totalEntries: number;
  totalWinners: number;
};

export default function ReportsPage() {
  const supabase = createClient();

  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    totalDraws: 0,
    totalEntries: 0,
    totalWinners: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      setError("");

      const [
        usersResult,
        drawsResult,
        entriesResult,
        winnersResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("draws")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("draw_entries")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("draw_winners")
          .select("*", { count: "exact", head: true }),
      ]);

      if (usersResult.error) {
        throw usersResult.error;
      }

      if (drawsResult.error) {
        throw drawsResult.error;
      }

      if (entriesResult.error) {
        throw entriesResult.error;
      }

      if (winnersResult.error) {
        throw winnersResult.error;
      }

      setAnalytics({
        totalUsers: usersResult.count || 0,
        totalDraws: drawsResult.count || 0,
        totalEntries: entriesResult.count || 0,
        totalWinners: winnersResult.count || 0,
      });
    } catch (error: unknown) {
      console.error("Analytics fetch error:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to load analytics");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "48px 6%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "40px",
        }}
      >
        <div>
          <p
            style={{
              color: "#009f7f",
              fontWeight: 700,
              letterSpacing: "1px",
              marginBottom: "12px",
            }}
          >
            DIGITAL HEROES ADMIN
          </p>

          <h1
            style={{
              fontSize: "42px",
              color: "#111827",
              margin: 0,
            }}
          >
            Report Analytics
          </h1>

          <p
            style={{
              color: "#475569",
              fontSize: "18px",
              marginTop: "12px",
            }}
          >
            Overview of users, draws, entries, and winners.
          </p>
        </div>

        <button
          onClick={() => {
            window.location.href = "/admin";
          }}
          style={{
            background: "#111827",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "16px 24px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Back to Admin Dashboard
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "18px",
            borderRadius: "12px",
            marginBottom: "24px",
          }}
        >
          Failed to load analytics: {error}
        </div>
      )}

      {/* Analytics Cards */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "24px",
        }}
      >
        <AnalyticsCard
          title="Total Users"
          value={analytics.totalUsers}
          icon="👥"
          loading={loading}
        />

        <AnalyticsCard
          title="Total Draws"
          value={analytics.totalDraws}
          icon="🎟️"
          loading={loading}
        />

        <AnalyticsCard
          title="Total Entries"
          value={analytics.totalEntries}
          icon="📋"
          loading={loading}
        />

        <AnalyticsCard
          title="Total Winners"
          value={analytics.totalWinners}
          icon="🏆"
          loading={loading}
        />
      </section>

      {/* Summary */}
      <section
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          marginTop: "32px",
        }}
      >
        <h2
          style={{
            color: "#111827",
            marginTop: 0,
            marginBottom: "16px",
          }}
        >
          Analytics Summary
        </h2>

        <p style={{ color: "#475569", fontSize: "16px" }}>
          This dashboard provides a quick overview of registered users,
          created draws, submitted entries, and recorded winners in the
          Digital Heroes platform.
        </p>
      </section>
    </main>
  );
}

function AnalyticsCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value: number;
  icon: string;
  loading: boolean;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "20px",
        padding: "28px",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          fontSize: "32px",
          marginBottom: "18px",
        }}
      >
        {icon}
      </div>

      <p
        style={{
          color: "#64748b",
          fontSize: "16px",
          margin: 0,
        }}
      >
        {title}
      </p>

      <h2
        style={{
          color: "#111827",
          fontSize: "36px",
          margin: "10px 0 0",
        }}
      >
        {loading ? "..." : value}
      </h2>
    </div>
  );
}