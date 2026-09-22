"use client";

import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const router = useRouter();
  const handleSubscribe = async (plan: "monthly" | "yearly") => {
  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Checkout failed");
    }

    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error(error);
    alert("Unable to start checkout. Please try again.");
  }
};
  const plans = [
    {
      name: "Monthly Hero",
      price: "£9.99",
      period: "/month",
      description: "Flexible monthly membership",
      features: [
        "Track your golf scores",
        "Participate in monthly rewards",
        "Support a charity of your choice",
      ],
    },
    {
      name: "Yearly Hero",
      price: "£99.99",
      period: "/year",
      description: "Best value for committed heroes",
      features: [
        "Everything in Monthly Hero",
        "Annual membership benefits",
        "Long-term charitable impact",
      ],
      popular: true,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f9fb] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-8 rounded-full border border-gray-300 px-5 py-2 text-sm hover:bg-white"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Choose your journey
          </p>

          <h1 className="text-4xl font-bold text-[#06132f]">
            Become a Digital Hero
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Choose a membership plan and start creating a bigger impact.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border bg-white p-8 shadow-sm ${
                plan.popular
                  ? "border-emerald-500 ring-2 ring-emerald-100"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <span className="absolute right-6 top-6 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Most Popular
                </span>
              )}

              <h2 className="text-2xl font-bold text-[#06132f]">
                {plan.name}
              </h2>

              <p className="mt-2 text-gray-600">{plan.description}</p>

              <div className="mt-6">
                <span className="text-5xl font-bold text-[#06132f]">
                  {plan.price}
                </span>

                <span className="ml-2 text-gray-500">{plan.period}</span>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-gray-700">
                    <span className="text-emerald-600">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                 onClick={() =>
                    handleSubscribe(plan.name === "Monthly Hero" ? "monthly" : "yearly")
                 }
                className="mt-8 w-full rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}