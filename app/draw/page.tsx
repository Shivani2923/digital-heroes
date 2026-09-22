"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Draw = {
  id: number;
  draw_month: string;
  draw_method: string;
  status: string;
  winning_numbers: number[] | null;
  jackpot_amount: number | null;
  jackpot_rollover: number | null;
  published_at: string | null;
};

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

export default function DrawPage() {
  const [draw, setDraw] = useState<Draw | null>(null);
  const [loading, setLoading] = useState(true);
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState("");
  const [entering, setEntering] = useState(false);
  const [userEntryNumbers, setUserEntryNumbers] = useState<number[]>([]);

  const [winners, setWinners] = useState<Winner[]>([]);
  const [loadingWinners, setLoadingWinners] = useState(false);

  useEffect(() => {
    fetchDraw();
  }, []);

  async function fetchDraw() {
    setLoading(true);
    setError("");

    const supabase = createClient();

    const {
      data: drawData,
      error: drawError,
    } = await supabase
      .from("draws")
      .select(
        `
        id,
        draw_month,
        draw_method,
        status,
        winning_numbers,
        jackpot_amount,
        jackpot_rollover,
        published_at,
        created_at
        `
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (drawError) {
      console.error("Error loading draw:", drawError);

      setError(`Unable to load the current draw: ${drawError.message}`);
      setLoading(false);
      return;
    }

    if (!drawData) {
      setDraw(null);
      setLoading(false);
      return;
    }

    const formattedDraw: Draw = {
      ...drawData,
      winning_numbers: Array.isArray(drawData.winning_numbers)
        ? drawData.winning_numbers
        : null,
    };

    setDraw(formattedDraw);

    await checkExistingEntry(drawData.id);
    await fetchWinners(drawData.id);

    setLoading(false);
  }

  async function fetchWinners(drawId: number) {
    try {
      setLoadingWinners(true);

    //   const response = await fetch(
    //     `/api/draw/winners?draw_id=${drawId}`
    //   );
    const response = await fetch(
  `/api/checkout/draw/winners?draw_id=${drawId}`,
  {
    cache: "no-store",
  }
);

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch winners:", data.error);
        setWinners([]);
        return;
      }

      setWinners(data.winners || []);
    } catch (error) {
      console.error("Error fetching winners:", error);
      setWinners([]);
    } finally {
      setLoadingWinners(false);
    }
  }

  async function checkExistingEntry(drawId: number) {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const {
      data: existingEntry,
      error: existingEntryError,
    } = await supabase
      .from("draw_entries")
      .select("id, entry_numbers")
      .eq("draw_id", drawId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingEntryError) {
      console.error(
        "Error checking existing entry:",
        existingEntryError.message
      );
      return;
    }

    if (existingEntry) {
      setEntered(true);

      if (Array.isArray(existingEntry.entry_numbers)) {
        setUserEntryNumbers(existingEntry.entry_numbers);
      }
    }
  }

  function generateEntryNumbers() {
    const numbers: number[] = [];

    while (numbers.length < 5) {
      const randomNumber = Math.floor(Math.random() * 45) + 1;

      if (!numbers.includes(randomNumber)) {
        numbers.push(randomNumber);
      }
    }

    return numbers.sort((a, b) => a - b);
  }

  async function enterDraw() {
    if (!draw) {
      alert("No draw is available.");
      return;
    }

    if (draw.status.toLowerCase() !== "open") {
      alert("This draw is currently closed.");
      return;
    }

    setEntering(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first.");
      setEntering(false);
      return;
    }

    const {
      data: subscription,
      error: subscriptionError,
    } = await supabase
      .from("subscriptions")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (subscriptionError) {
      console.error(
        "Subscription verification error:",
        subscriptionError.message
      );

      alert("Unable to verify your subscription.");
      setEntering(false);
      return;
    }

    if (!subscription) {
      alert("You need an active subscription to enter the draw.");
      setEntering(false);
      return;
    }

    const {
      data: existingEntry,
      error: existingEntryError,
    } = await supabase
      .from("draw_entries")
      .select("id, entry_numbers")
      .eq("draw_id", draw.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingEntryError) {
      console.error(
        "Error checking existing entry:",
        existingEntryError.message
      );

      alert("Unable to check your existing entry.");
      setEntering(false);
      return;
    }

    if (existingEntry) {
      setEntered(true);

      if (Array.isArray(existingEntry.entry_numbers)) {
        setUserEntryNumbers(existingEntry.entry_numbers);
      }

      alert("You have already entered this draw.");
      setEntering(false);
      return;
    }

    const entryNumbers = generateEntryNumbers();

    const { data: latestScore } = await supabase
      .from("golf_scores")
      .select("score")
      .eq("user_id", user.id)
      .order("played_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error: entryError } = await supabase
      .from("draw_entries")
      .insert({
        draw_id: draw.id,
        user_id: user.id,
        entry_numbers: entryNumbers,
        score_snapshot: latestScore?.score ?? null,
      });

    if (entryError) {
      console.error("Error entering draw:", entryError);

      alert(`Unable to enter the draw: ${entryError.message}`);
      setEntering(false);
      return;
    }

    setEntered(true);
    setUserEntryNumbers(entryNumbers);

    alert("You have successfully entered the monthly draw!");

    setEntering(false);
  }

  function formatDate(date: string | null) {
    if (!date) {
      return "Not published";
    }

    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Back Button */}
        <a
          href="/dashboard"
          className="mb-8 inline-block rounded-full border border-slate-300 px-5 py-2 text-sm text-slate-700 transition hover:bg-white"
        >
          ← Back to Dashboard
        </a>

        {/* Main Card */}
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Monthly Rewards
          </p>

          <h1 className="mt-3 text-4xl font-bold text-slate-950">
            Monthly Digital Heroes Draw
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Participate in the monthly draw, enjoy the excitement of winning,
            and help create a positive impact through your membership.
          </p>

          {/* Loading State */}
          {loading && (
            <div className="mt-10 rounded-2xl bg-slate-100 p-8">
              <p className="text-slate-600">Loading current draw...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6">
              <h2 className="text-lg font-bold text-red-800">
                Error Loading Draw
              </h2>

              <p className="mt-2 text-red-700">{error}</p>

              <button
                onClick={fetchDraw}
                className="mt-5 rounded-full bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No Draw State */}
          {!loading && !error && !draw && (
            <div className="mt-10 rounded-2xl bg-slate-100 p-8">
              <h2 className="text-xl font-bold text-slate-900">
                No draw available
              </h2>

              <p className="mt-2 text-slate-600">
                The next monthly draw has not been created yet. Please check
                again later.
              </p>
            </div>
          )}

          {/* Draw Details */}
          {!loading && !error && draw && (
            <div className="mt-10">
              {/* Information Cards */}
              <div className="grid gap-5 md:grid-cols-3">
                {/* Draw Month */}
                <div className="rounded-2xl bg-emerald-50 p-6">
                  <p className="text-sm font-medium text-emerald-700">
                    Draw Month
                  </p>

                  <p className="mt-3 text-2xl font-bold text-emerald-950">
                    {new Date(draw.draw_month).toLocaleDateString("en-GB", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Draw Status */}
                <div className="rounded-2xl bg-blue-50 p-6">
                  <p className="text-sm font-medium text-blue-700">
                    Draw Status
                  </p>

                  <p className="mt-3 text-2xl font-bold capitalize text-blue-950">
                    {draw.status}
                  </p>
                </div>

                {/* Prize Pool */}
                <div className="rounded-2xl bg-yellow-50 p-6">
                  <p className="text-sm font-medium text-yellow-700">
                    Prize Pool
                  </p>

                  <p className="mt-3 text-2xl font-bold text-yellow-950">
                    £{Number(draw.jackpot_amount ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-6">
                  <p className="text-sm font-medium text-slate-500">
                    Draw Method
                  </p>

                  <p className="mt-2 text-lg font-semibold capitalize text-slate-900">
                    {draw.draw_method}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-6">
                  <p className="text-sm font-medium text-slate-500">
                    Jackpot Rollover
                  </p>

                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    £{Number(draw.jackpot_rollover ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* How to Participate */}
              <div className="mt-8 rounded-2xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900">
                  How to participate
                </h2>

                <ul className="mt-4 space-y-3 text-slate-600">
                  <li>✓ Maintain an active Digital Heroes subscription.</li>
                  <li>✓ Enter the current monthly draw.</li>
                  <li>✓ Receive five randomly generated entry numbers.</li>
                  <li>✓ Wait for the winning numbers to be announced.</li>
                  <li>✓ Check whether your numbers match the winning numbers.</li>
                </ul>
              </div>

              {/* User Entry Numbers */}
              {entered && userEntryNumbers.length > 0 && (
                <div className="mt-8 rounded-2xl bg-emerald-50 p-6">
                  <h2 className="text-xl font-bold text-emerald-950">
                    Your Draw Entry
                  </h2>

                  <p className="mt-2 text-emerald-800">
                    You have successfully entered this monthly draw.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    {userEntryNumbers.map((number, index) => (
                      <span
                        key={`${number}-${index}`}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white"
                      >
                        {number}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Enter Draw Button */}
              <button
                onClick={enterDraw}
                disabled={
                  entering ||
                  entered ||
                  draw.status.toLowerCase() !== "open"
                }
                className="mt-8 w-full rounded-full bg-emerald-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {entering
                  ? "Processing..."
                  : entered
                    ? "Successfully Entered"
                    : draw.status.toLowerCase() !== "open"
                      ? "Draw Currently Closed"
                      : "Enter Monthly Draw"}
              </button>

              {/* Winning Numbers */}
              {draw.winning_numbers &&
                draw.winning_numbers.length > 0 && (
                  <div className="mt-8 rounded-2xl bg-slate-100 p-6">
                    <h2 className="text-xl font-bold text-slate-900">
                      Winning Numbers
                    </h2>

                    <p className="mt-2 text-slate-600">
                      Published on {formatDate(draw.published_at)}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      {draw.winning_numbers.map((number, index) => (
                        <span
                          key={`${number}-${index}`}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white"
                        >
                          {number}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Draw Winners */}
              <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">
                    🏆 Draw Winners
                  </h2>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                    {winners.length} Winner{winners.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {loadingWinners ? (
                  <p className="mt-5 text-slate-500">
                    Loading winners...
                  </p>
                ) : winners.length === 0 ? (
                  <div className="mt-5 rounded-xl bg-slate-50 p-5">
                    <p className="text-slate-600">
                      No winners have been announced for this draw yet.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[650px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="p-3 text-sm font-semibold text-slate-700">
                            Prize Tier
                          </th>

                          <th className="p-3 text-sm font-semibold text-slate-700">
                            Matched Numbers
                          </th>

                          <th className="p-3 text-sm font-semibold text-slate-700">
                            Prize Amount
                          </th>

                          <th className="p-3 text-sm font-semibold text-slate-700">
                            Verification
                          </th>

                          <th className="p-3 text-sm font-semibold text-slate-700">
                            Payout
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {winners.map((winner) => (
                          <tr
                            key={winner.id}
                            className="border-b border-slate-100"
                          >
                            <td className="p-3 font-semibold capitalize text-slate-900">
                              {winner.prize_tier}
                            </td>

                            <td className="p-3 text-slate-700">
                              {winner.matched_numbers}
                            </td>

                            <td className="p-3 font-bold text-emerald-600">
                              £
                              {Number(winner.prize_amount).toFixed(2)}
                            </td>

                            <td className="p-3">
                              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold capitalize text-yellow-800">
                                {winner.verification_status}
                              </span>
                            </td>

                            <td className="p-3">
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">
                                {winner.payout_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}