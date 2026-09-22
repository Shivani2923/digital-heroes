export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { requirePremium } from "@/lib/auth/permissions";

export default async function ScoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = await requirePremium();

  if (!account.authorized) {
    redirect("/subscription");
  }

  return <>{children}</>;
}