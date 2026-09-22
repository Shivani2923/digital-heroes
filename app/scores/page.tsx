"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type GolfScore = {
  id: number;
  score: number;
  played_date: string;
  created_at: string;
};

export default function ScoresPage() {
  const [score, setScore] = useState("");
  const [playedDate, setPlayedDate] = useState("");
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  async function fetchScores() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in to view your golf scores.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("golf_scores")
      .select("id, score, played_date, created_at")
      .eq("user_id", user.id)
      .order("played_date", { ascending: false });

    if (error) {
      console.error("Error fetching golf scores:", error.message);
      setError("Unable to load your golf scores.");
    } else {
      setScores(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchScores();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const numericScore = Number(score);

    if (!score || numericScore < 0 || numericScore > 45) {
      setError("Please enter a Stableford score between 0 and 45.");
      return;
    }

    if (!playedDate) {
      setError("Please select the date you played.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in to save a golf score.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("golf_scores").insert({
      user_id: user.id,
      score: numericScore,
      played_date: playedDate,
    });

    if (error) {
      console.error("Error saving golf score:", error.message);
      setError("Unable to save your score.");
    } else {
      setScore("");
      setPlayedDate("");
      await fetchScores();
      alert("Golf score saved successfully!");
    }

    setSaving(false);
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this golf score?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("golf_scores")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting golf score:", error.message);
      alert("Unable to delete score.");
    } else {
      setScores((previousScores) =>
        previousScores.filter((item) => item.id !== id)
      );
    }
  }

  const totalScores = scores.length;

  const averageScore =
    totalScores > 0
      ? (
          scores.reduce((total, item) => total + item.score, 0) /
          totalScores
        ).toFixed(1)
      : "0";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Back to Dashboard */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
            Track Your Progress
          </p>

          <h1 className="text-4xl font-bold text-slate-900">
            Golf Score Management
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Record your Stableford scores and keep track of your golf
            performance over time.
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">
              Total Rounds
            </p>

            <p className="mt-2 text-4xl font-bold text-slate-900">
              {totalScores}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">
              Average Stableford Score
            </p>

            <p className="mt-2 text-4xl font-bold text-emerald-600">
              {averageScore}
            </p>
          </div>
        </div>

        {/* Add Golf Score */}
        <section className="mb-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Add Golf Score
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >
            <div>
              <label
                htmlFor="score"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Stableford Score
              </label>

              <input
                id="score"
                type="number"
                min="0"
                max="45"
                value={score}
                onChange={(event) => setScore(event.target.value)}
                placeholder="Enter score from 0 to 45"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label
                htmlFor="playedDate"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Date Played
              </label>

              <input
                id="playedDate"
                type="date"
                value={playedDate}
                onChange={(event) => setPlayedDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700 md:col-span-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
            >
              {saving ? "Saving Score..." : "Save Golf Score"}
            </button>
          </form>
        </section>

        {/* Score History */}
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Score History
          </h2>

          {loading && (
            <p className="text-slate-600">Loading your scores...</p>
          )}

          {!loading && scores.length === 0 && (
            <p className="text-slate-600">
              No scores recorded yet. Add your first golf score above.
            </p>
          )}

          {!loading && scores.length > 0 && (
            <div className="space-y-4">
              {scores.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {item.score} Stableford Points
                    </p>

                    <p className="text-sm text-slate-500">
                      Played on{" "}
                      {new Date(item.played_date).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}