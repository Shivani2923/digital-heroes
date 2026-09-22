"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Charity = {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
  created_at?: string;
};

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [filteredCharities, setFilteredCharities] = useState<Charity[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCharityId, setSelectedCharityId] = useState<number | null>(
    null
  );

  const [donationPercentage, setDonationPercentage] = useState(10);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch active charities
  useEffect(() => {
    async function fetchCharities() {
      const supabase = createClient();

      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("charities")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching charities:", error.message);
        setError("Unable to load charities.");
      } else {
        const charityData = data || [];

        setCharities(charityData);
        setFilteredCharities(charityData);
      }

      setLoading(false);
    }

    fetchCharities();
  }, []);

  // Search charities
  useEffect(() => {
    const searchValue = searchTerm.toLowerCase().trim();

    const filtered = charities.filter((charity) => {
      return (
        charity.name.toLowerCase().includes(searchValue) ||
        charity.description.toLowerCase().includes(searchValue)
      );
    });

    setFilteredCharities(filtered);
  }, [searchTerm, charities]);

  // Save selected charity preference
  async function saveCharityPreference(charity: Charity) {
    setSaving(true);
    setSuccessMessage("");
    setError("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Please log in to select a charity.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("user_charities").upsert(
      {
        user_id: user.id,
        charity_id: charity.id,
        donation_percentage: donationPercentage,
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      console.error("Error saving charity preference:", error.message);
      setError("Unable to save charity preference. Please try again.");
    } else {
      setSuccessMessage(
        `${charity.name} selected successfully with a ${donationPercentage}% contribution.`
      );

      setSelectedCharityId(null);
    }

    setSaving(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
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
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
            Make an Impact
          </p>

          <h1 className="mb-4 text-4xl font-bold text-slate-900">
            Support a Charity
          </h1>

          <p className="max-w-2xl text-lg text-slate-600">
            Choose a cause that matters to you and decide how much of your
            contribution should support charity.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-100 p-4 font-semibold text-emerald-800">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Search Box */}
        <div className="mb-8">
          <label
            htmlFor="charitySearch"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Search Charities
          </label>

          <input
            id="charitySearch"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by charity name or description..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-xl bg-white p-6 text-center text-slate-600 shadow-sm">
            Loading charities...
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCharities.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-700">
              No charities found.
            </p>

            <p className="mt-2 text-slate-500">
              Try searching with a different keyword.
            </p>
          </div>
        )}

        {/* Charity Cards */}
        {!loading && filteredCharities.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCharities.map((charity) => (
              <div
                key={charity.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Charity Image */}
                {charity.image_url ? (
                  <img
                    src={charity.image_url}
                    alt={charity.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-emerald-100 text-6xl">
                    💚
                  </div>
                )}

                <div className="p-6">
                  {/* Status Badge */}
                  <span className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Active Charity
                  </span>

                  {/* Charity Name */}
                  <h2 className="mb-3 text-2xl font-bold text-slate-900">
                    {charity.name}
                  </h2>

                  {/* Charity Description */}
                  <p className="mb-5 min-h-20 text-slate-600">
                    {charity.description}
                  </p>

                  {/* Selection Form */}
                  {selectedCharityId === charity.id ? (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-emerald-50 p-3">
                        <p className="font-semibold text-emerald-700">
                          Your selected charity
                        </p>
                      </div>

                      {/* Contribution Slider */}
                      <div>
                        <label
                          htmlFor={`donation-${charity.id}`}
                          className="mb-2 block font-semibold text-slate-700"
                        >
                          Charity Contribution: {donationPercentage}%
                        </label>

                        <input
                          id={`donation-${charity.id}`}
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={donationPercentage}
                          onChange={(event) =>
                            setDonationPercentage(
                              Number(event.target.value)
                            )
                          }
                          className="w-full accent-emerald-600"
                        />

                        <div className="flex justify-between text-xs text-slate-500">
                          <span>10% minimum</span>
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={() => saveCharityPreference(charity)}
                        disabled={saving}
                        className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving
                          ? "Saving..."
                          : "Save Charity Preference"}
                      </button>

                      {/* Cancel Button */}
                      <button
                        onClick={() => setSelectedCharityId(null)}
                        disabled={saving}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    /* Select Charity Button */
                    <button
                      onClick={() => {
                        setSelectedCharityId(charity.id);
                        setDonationPercentage(10);
                        setSuccessMessage("");
                        setError("");
                      }}
                      className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Select Charity
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}