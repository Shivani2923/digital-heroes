import { createClient } from "@/lib/supabase/server";

export type AccountType = "visitor" | "normal" | "premium" | "admin";

export async function getCurrentAccount() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      subscription: null,
      accountType: "visitor" as AccountType,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let accountType: AccountType = "normal";

  if (profile?.role === "admin") {
    accountType = "admin";
  } else if (subscription?.status === "active") {
    accountType = "premium";
  }

  return {
    user,
    profile,
    subscription,
    accountType,
  };
}

export async function requireAdmin() {
  const account = await getCurrentAccount();

  return {
    ...account,
    authorized:
      account.user !== null && account.accountType === "admin",
  };
}

export async function requirePremium() {
  const account = await getCurrentAccount();

  return {
    ...account,
    authorized:
      account.user !== null &&
      (account.accountType === "premium" ||
        account.accountType === "admin"),
  };
}