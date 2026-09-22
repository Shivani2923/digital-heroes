import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-emerald-50 px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <LoginForm />
      </div>
    </main>
  );
}