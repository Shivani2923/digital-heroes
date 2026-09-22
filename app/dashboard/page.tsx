import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/logout-button";

async function DashboardContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch the user's latest subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan_type, status, renewal_date")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch the user's golf scores
  const { data: golfScores } = await supabase
    .from("golf_scores")
    .select("score")
    .eq("user_id", user.id);

  const totalRounds = golfScores?.length || 0;

  const averageScore =
    totalRounds > 0
      ? (
          golfScores!.reduce((total, item) => total + item.score, 0) /
          totalRounds
        ).toFixed(1)
      : "0";

  // Fetch the user's selected charity
  const { data: userCharity } = await supabase
    .from("user_charities")
    .select("charity_id, donation_percentage")
    .eq("user_id", user.id)
    .maybeSingle();

  let charityName = "Not Selected";
  let donationPercentage = 10;

  if (userCharity) {
    donationPercentage = userCharity.donation_percentage || 10;

    const { data: charity } = await supabase
      .from("charities")
      .select("name")
      .eq("id", userCharity.charity_id)
      .maybeSingle();

    if (charity) {
      charityName = charity.name;
    }
  }

  const isSubscriptionActive = subscription?.status === "active";

  const subscriptionTitle = isSubscriptionActive
    ? subscription?.plan_type === "yearly"
      ? "Yearly Hero"
      : "Monthly Hero"
    : "Not Active";

  const subscriptionDescription = isSubscriptionActive
    ? subscription?.renewal_date
      ? `Renews on ${new Date(
          subscription.renewal_date
        ).toLocaleDateString()}`
      : "Your membership is active."
    : "Choose a plan to become a Digital Hero.";

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white px-8 py-6">
        <h1 className="text-2xl font-bold">
          Digital<span className="text-emerald-500">Heroes</span>
        </h1>

        <div className="flex items-center gap-6">
          <p className="text-slate-600">
            Welcome{" "}
            <span className="font-semibold text-slate-900">
              {user.email}
            </span>
          </p>

          <LogoutButton />
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="mx-auto max-w-7xl px-8 py-16">
        <p className="mb-4 font-semibold uppercase tracking-widest text-emerald-600">
          Your journey starts here
        </p>

        <h2 className="text-4xl font-bold text-slate-950">
          Welcome to your dashboard
        </h2>

        <p className="mt-4 text-lg text-slate-600">
          Track your golf performance, support meaningful causes, and
          participate in monthly rewards.
        </p>

        {/* Dashboard Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Subscription Card */}
          <Link
            href="/subscription"
            className="block rounded-2xl border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-slate-500">Subscription</p>

            <h3 className="mt-4 text-2xl font-bold text-slate-900">
              {subscriptionTitle}
            </h3>

            <p className="mt-2 text-slate-500">
              {subscriptionDescription}
            </p>

            <p className="mt-6 font-semibold text-emerald-600">
              {isSubscriptionActive
                ? "Manage subscription →"
                : "View subscription plans →"}
            </p>
          </Link>

          {/* Golf Scores Card */}
          <Link
            href="/scores"
            className="block rounded-2xl border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-slate-500">Golf Scores</p>

            <h3 className="mt-4 text-2xl font-bold text-slate-900">
              {totalRounds} Rounds
            </h3>

            <p className="mt-2 text-slate-500">
              Average Stableford score:{" "}
              <span className="font-semibold text-emerald-600">
                {averageScore}
              </span>
            </p>

            <p className="mt-6 font-semibold text-emerald-600">
              Add golf score →
            </p>
          </Link>

          {/* Charity Card */}
          <Link
            href="/charities"
            className="block rounded-2xl border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-slate-500">Charity Impact</p>

            <h3 className="mt-4 text-2xl font-bold text-slate-900">
              {charityName}
            </h3>

            <p className="mt-2 text-slate-500">
              {charityName === "Not Selected"
                ? "Choose a cause that matters to you."
                : `${donationPercentage}% of your contribution supports this charity.`}
            </p>

            <p className="mt-6 font-semibold text-emerald-600">
              {charityName === "Not Selected"
                ? "Explore charities →"
                : "Change charity →"}
            </p>
          </Link>

          {/* Monthly Draw Card */}
          <Link
            href="/draw"
            className="block rounded-2xl border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-slate-500">Monthly Draw</p>

            <h3 className="mt-4 text-2xl font-bold text-slate-900">
              Participate & Win
            </h3>

            <p className="mt-2 text-slate-500">
              Enter the monthly draw and check your winning numbers.
            </p>

            <p className="mt-6 font-semibold text-emerald-600">
              View draw details →
            </p>
          </Link>
        </div>

        {/* Additional Statistics */}
        <div className="mt-8 rounded-2xl border bg-white p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900">
            Your Digital Hero Summary
          </h3>

          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">Membership Status</p>

              <p className="mt-1 font-semibold text-emerald-600">
                {isSubscriptionActive ? "Active" : "Inactive"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Golf Rounds</p>

              <p className="mt-1 font-semibold text-slate-900">
                {totalRounds}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Charity Donation</p>

              <p className="mt-1 font-semibold text-slate-900">
                {charityName === "Not Selected"
                  ? "Not selected"
                  : `${donationPercentage}%`}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            Loading dashboard...
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </main>
  );
}