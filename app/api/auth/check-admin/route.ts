import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { isAdmin: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { isAdmin: false, error: "Profile not found" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      isAdmin: profile.role === "admin",
      role: profile.role,
    });
  } catch (error) {
    console.error("Admin check error:", error);

    return NextResponse.json(
      { isAdmin: false, error: "Server error" },
      { status: 500 }
    );
  }
}