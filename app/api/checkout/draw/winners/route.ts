export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const drawId = searchParams.get("draw_id");

    let query = supabaseAdmin
      .from("draw_winners")
      .select(`
        id,
        draw_id,
        user_id,
        entry_id,
        matched_numbers,
        prize_tier,
        prize_amount,
        verification_status,
        payout_status
      `)
      .order("prize_amount", { ascending: false });

    // Filter by draw only when draw_id is provided
    if (drawId) {
      query = query.eq("draw_id", Number(drawId));
    }

    const { data: winners, error } = await query;

    if (error) {
      console.error("Winner fetch error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      winners: winners || [],
    });
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch winners" },
      { status: 500 }
    );
  }
}