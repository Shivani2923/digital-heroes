import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/permissions";

async function AdminAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await requireAdmin();

  if (!account.authorized) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
            <p className="text-sm text-slate-600">
              Verifying admin access...
            </p>
          </div>
        </div>
      }
    >
      <AdminAccessGuard>{children}</AdminAccessGuard>
    </Suspense>
  );
}