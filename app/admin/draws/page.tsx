"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Draw = {
  id: number;
  draw_month: string;
  draw_method: string;
  status: string;
  winning_numbers: number[] | null;
  jackpot_amount: number | null;
  jackpot_rollover: number | null;
  published_at: string | null;
  created_at: string;
};

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create draw states
  const [drawMonth, setDrawMonth] = useState("");
  const [drawMethod, setDrawMethod] = useState("random");
  const [jackpotAmount, setJackpotAmount] = useState("");
  const [status, setStatus] = useState("open");
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState("");

  async function fetchDraws() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/draws", {
        cache: "no-store",
      });

      const responseText = await response.text();

      let data;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to fetch draws. Status: ${response.status}`
        );
      }

      setDraws(data.draws || []);
    } catch (error) {
      console.error("Error fetching draws:", error);
      setError("Unable to load draws.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDraws();
  }, []);

  async function handleCreateDraw(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/draws", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draw_month: drawMonth,
          draw_method: drawMethod,
          jackpot_amount: Number(jackpotAmount),
          jackpot_rollover: 0,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create draw");
      }

      setSuccess("Draw created successfully!");

      // Clear form
      setDrawMonth("");
      setDrawMethod("random");
      setJackpotAmount("");
      setStatus("open");

      // Refresh draw list
      await fetchDraws();
    } catch (error) {
      console.error("Create draw error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create draw."
      );
    } finally {
      setCreating(false);
    }
  }
  async function handleGenerateWinningNumbers(drawId: number) {
  const confirmed = window.confirm(
    "Are you sure you want to generate winning numbers for this draw?"
  );

  if (!confirmed) return;

  setError("");
  setSuccess("");

  try {
    const response = await fetch(
      "/api/admin/draws/generate-winning-numbers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draw_id: drawId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to generate winning numbers"
      );
    }

    setSuccess("Winning numbers generated successfully!");

    await fetchDraws();
  } catch (error) {
    console.error("Generate winning numbers error:", error);

    setError(
      error instanceof Error
        ? error.message
        : "Failed to generate winning numbers."
    );
  }
}
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
              Draw Management
            </h1>

            <p className="mt-2 text-slate-600">
              View and manage monthly draws and winning numbers.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-lg bg-slate-900 px-5 py-3 text-center font-semibold text-white hover:bg-slate-700"
          >
            Back to Admin Dashboard
          </Link>
        </div>

        {/* Create New Draw */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-900">
            Create New Draw
          </h2>

          <form
            onSubmit={handleCreateDraw}
            className="grid gap-5 md:grid-cols-2"
          >
            {/* Draw Month */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Draw Month
              </label>

              <input
                type="date"
                value={drawMonth}
                onChange={(event) => setDrawMonth(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Draw Method */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Draw Method
              </label>

              <select
                value={drawMethod}
                onChange={(event) => setDrawMethod(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="random">Random</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            {/* Jackpot Amount */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Jackpot Amount (£)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={jackpotAmount}
                onChange={(event) => setJackpotAmount(event.target.value)}
                placeholder="1000"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Messages */}
            {success && (
              <p className="md:col-span-2 rounded-lg bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700">
                {success}
              </p>
            )}

            {error && (
              <p className="md:col-span-2 rounded-lg bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}

            {/* Submit */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creating Draw..." : "Create Draw"}
              </button>
            </div>
          </form>
        </div>

        {/* Draw List */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              All Draws
            </h2>
          </div>

          {loading && (
            <p className="px-6 py-8 text-slate-600">
              Loading draws...
            </p>
          )}

          {!loading && error && !success && (
            <p className="px-6 py-8 text-red-600">
              {error}
            </p>
          )}

          {!loading && !error && draws.length === 0 && (
            <p className="px-6 py-8 text-slate-600">
              No draws found.
            </p>
          )}

          {!loading && draws.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Draw ID
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Draw Month
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Method
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Winning Numbers
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Jackpot
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Published
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                     Actions
                     </th>
                  </tr>
                </thead>

                <tbody>
                  {draws.map((draw) => (
                    <tr
                      key={draw.id}
                      className="border-t border-slate-200"
                    >
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {draw.id}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {draw.draw_month}
                      </td>

                      <td className="px-6 py-4 text-sm capitalize text-slate-700">
                        {draw.draw_method}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                          {draw.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {draw.winning_numbers &&
                        draw.winning_numbers.length > 0 ? (
                          <div className="flex gap-1">
                            {draw.winning_numbers.map((number, index) => (
                              <span
                                key={index}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white"
                              >
                                {number}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Not published
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-semibold text-emerald-600">
                        £{Number(draw.jackpot_amount || 0).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {draw.published_at
                          ? new Date(
                              draw.published_at
                            ).toLocaleDateString()
                          : "Not published"}
                      </td>
                      <td className="px-6 py-4">
  {draw.status === "open" &&
  (!draw.winning_numbers ||
    draw.winning_numbers.length === 0) ? (
    <button
      onClick={() => handleGenerateWinningNumbers(draw.id)}
      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
    >
      Generate Numbers
    </button>
  ) : draw.status === "published" ? (
    <span className="text-sm font-semibold text-emerald-600">
      Completed
    </span>
  ) : (
    <span className="text-sm text-slate-400">
      Not available
    </span>
  )}
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