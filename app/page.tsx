import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Join the community",
    description:
      "Choose a monthly or yearly subscription and become part of a community creating positive change.",
  },
  {
    number: "02",
    title: "Track your golf",
    description:
      "Enter your Stableford scores and keep track of your golf performance over time.",
  },
  {
    number: "03",
    title: "Make an impact",
    description:
      "Support a charity of your choice while participating in monthly reward draws.",
  },
];

const features = [
  {
    title: "Golf performance",
    description:
      "Record your Stableford scores and follow your progress through your personal dashboard.",
  },
  {
    title: "Monthly rewards",
    description:
      "Participate in monthly draws with opportunities based on the platform’s reward system.",
  },
  {
    title: "Charity first",
    description:
      "Choose a charity and help contribute to meaningful causes through your subscription.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Digital<span className="text-emerald-600">Heroes</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#how-it-works" className="transition hover:text-emerald-600">
              How it works
            </a>
            <a href="#impact" className="transition hover:text-emerald-600">
              Our impact
            </a>
            <a href="#features" className="transition hover:text-emerald-600">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-slate-100 sm:block"
            >
              Log in
            </Link>

            <Link
              href="/auth/sign-up"
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.25),_transparent_40%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
              Play with purpose
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your passion for golf can create a{" "}
              <span className="text-emerald-400">bigger impact.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Track your golf performance, support meaningful causes, and
              participate in monthly rewards — all in one community-driven
              platform.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/auth/sign-up"
                className="rounded-full bg-emerald-500 px-7 py-3.5 text-center font-semibold text-white transition hover:bg-emerald-400"
              >
                Become a Digital Hero
              </Link>

              <a
                href="#how-it-works"
                className="rounded-full border border-slate-600 px-7 py-3.5 text-center font-semibold text-white transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Discover how it works
              </a>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
              <div className="rounded-2xl bg-emerald-500 p-6 text-slate-950">
                <p className="text-sm font-semibold uppercase tracking-widest">
                  Your impact starts here
                </p>

                <h2 className="mt-4 text-4xl font-bold">
                  Play.
                  <br />
                  Give.
                  <br />
                  Win.
                </h2>

                <div className="mt-10 h-2 rounded-full bg-emerald-900/20">
                  <div className="h-2 w-3/4 rounded-full bg-slate-950" />
                </div>

                <p className="mt-3 text-sm font-medium">
                  One community. Multiple ways to make a difference.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-bold text-white">Golf</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Track your progress
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-bold text-white">Charity</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Support causes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-semibold uppercase tracking-widest text-emerald-600">
            More than a game
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Small actions. Meaningful impact.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Digital Heroes brings together golf, community, charity, and
            monthly rewards in one simple experience. Every subscription helps
            support charitable causes while giving members access to platform
            features and reward opportunities.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="text-center">
            <p className="font-semibold uppercase tracking-widest text-emerald-600">
              Simple by design
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              How Digital Heroes works
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Start your journey in three simple steps.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="text-4xl font-bold text-emerald-600">
                  {step.number}
                </span>

                <h3 className="mt-6 text-xl font-bold">{step.title}</h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-semibold uppercase tracking-widest text-emerald-600">
              Built around you
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need in one place
            </h2>

            <p className="mt-5 leading-7 text-slate-600">
              From tracking your scores to exploring charities and viewing
              your reward activity, your dashboard keeps your journey simple
              and clear.
            </p>

            <Link
              href="/auth/sign-up"
              className="mt-7 inline-block rounded-full bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Start your journey
            </Link>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                    {index + 1}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="mt-2 leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charity Impact */}
      <section id="impact" className="bg-emerald-600">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
          <p className="font-semibold uppercase tracking-widest text-emerald-100">
            Your choice matters
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Support a cause that means something to you.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-emerald-50">
            Explore charity profiles, choose a cause during signup, and help
            direct a portion of your subscription toward charitable impact.
          </p>

          <Link
            href="/auth/sign-up"
            className="mt-8 inline-block rounded-full bg-white px-7 py-3.5 font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Choose your cause
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to become a Digital Hero?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-slate-600">
          Join a community where your passion can support something bigger.
        </p>

        <Link
          href="/auth/sign-up"
          className="mt-8 inline-block rounded-full bg-emerald-600 px-8 py-3.5 font-semibold text-white transition hover:bg-emerald-700"
        >
          Create your account
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-center text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-8">
          <p>
            © 2026 Digital Heroes. All rights reserved. Digital Heroes. All rights reserved.
          </p>

          <div className="flex justify-center gap-5">
            <Link href="/auth/login" className="hover:text-white">
              Login
            </Link>

            <Link href="/auth/sign-up" className="hover:text-white">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}