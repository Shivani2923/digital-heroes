import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const {
      winner_id,
      verification_status,
      payout_status,
    } = body;

    if (!winner_id) {
      return NextResponse.json(
        { error: "winner_id is required" },
        { status: 400 }
      );
    }

    if (!verification_status && !payout_status) {
      return NextResponse.json(
        { error: "At least one status is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, string> = {};

    if (verification_status) {
      updateData.verification_status = verification_status;
    }

    if (payout_status) {
      updateData.payout_status = payout_status;
    }

    const { data, error } = await supabaseAdmin
      .from("draw_winners")
      .update(updateData)
      .eq("id", winner_id)
      .select()
      .single();

    if (error) {
      console.error("Winner update error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      winner: data,
    });
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      { error: "Failed to update winner" },
      { status: 500 }
    );
  }
}