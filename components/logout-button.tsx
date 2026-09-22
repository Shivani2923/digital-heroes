"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.push("/auth/login");
      router.refresh();
    }

    setIsLoading(false);
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="rounded-full bg-[#020617] px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
    >
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}