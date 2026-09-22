"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Winner = {
  id: number;
  draw_id: number;
  user_id: string;
  entry_id: number;
  matched_numbers: number;
  prize_tier: string;
  prize_amount: number;
  verification_status: string;
  payout_status: string;
};

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchWinners() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/checkout/draw/winners", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch winners");
      }

      setWinners(data.winners || []);
    } catch (error) {
      console.error("Error fetching winners:", error);
      setError("Unable to load winners.");
    } finally {
      setLoading(false);
    }
  }
  async function updateWinner(
  winnerId: number,
  field: "verification_status" | "payout_status",
  value: string
) {
  try {
    const response = await fetch("/api/admin/winners", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        winner_id: winnerId,
        [field]: value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to update winner");
    }

    alert("Winner status updated successfully!");

    fetchWinners();
  } catch (error) {
    console.error("Error updating winner:", error);
    alert("Failed to update winner status.");
  }
}

  useEffect(() => {
    fetchWinners();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Digital Heroes Admin
            </p>

            <h1 className="mt-2 text-4xl font-bold text-slate-900">
              Winner Verification
            </h1>

            <p className="mt-2 text-slate-600">
              Review winners and manage verification and payout status.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-lg bg-slate-900 px-5 py-3 text-center font-semibold text-white hover:bg-slate-700"
          >
            Back to Admin Dashboard
          </Link>
        </div>

        {/* Content */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              All Draw Winners
            </h2>
          </div>

          {loading && (
            <p className="px-6 py-8 text-slate-600">
              Loading winners...
            </p>
          )}

          {error && (
            <p className="px-6 py-8 text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && winners.length === 0 && (
            <p className="px-6 py-8 text-slate-600">
              No winners found.
            </p>
          )}

          {!loading && !error && winners.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Winner ID
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      User ID
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Prize Tier
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Matched
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Prize Amount
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Verification
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Payout
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {winners.map((winner) => (
                    <tr
                      key={winner.id}
                      className="border-t border-slate-200"
                    >
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {winner.id}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {winner.user_id}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {winner.prize_tier}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {winner.matched_numbers}
                      </td>

                      <td className="px-6 py-4 font-semibold text-emerald-600">
                        £{Number(winner.prize_amount).toFixed(2)}
                      </td>

                       <td className="px-6 py-4">
  <div className="flex flex-col gap-2">
    <span className="rounded-full bg-yellow-100 px-3 py-1 text-center text-sm font-semibold text-yellow-800">
      {winner.verification_status}
    </span>

    {winner.verification_status === "pending" && (
      <div className="flex gap-2">
        <button
          onClick={() =>
            updateWinner(
              winner.id,
              "verification_status",
              "approved"
            )
          }
          className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          Approve
        </button>

        <button
          onClick={() =>
            updateWinner(
              winner.id,
              "verification_status",
              "rejected"
            )
          }
          className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
        >
          Reject
        </button>
      </div>
    )}
  </div>
</td>
                    <td className="px-6 py-4">
  <div className="flex flex-col gap-2">
    <span className="rounded-full bg-slate-100 px-3 py-1 text-center text-sm font-semibold text-slate-700">
      {winner.payout_status}
    </span>

    {winner.verification_status === "approved" &&
      winner.payout_status === "pending" && (
        <button
          onClick={() =>
            updateWinner(
              winner.id,
              "payout_status",
              "paid"
            )
          }
          className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Mark Paid
        </button>
      )}
  </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}