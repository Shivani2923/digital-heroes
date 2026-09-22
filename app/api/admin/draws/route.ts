import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET: Fetch all draws
export async function GET() {
  try {
    const { data: draws, error } = await supabaseAdmin
      .from("draws")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Draw fetch error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draws: draws || [],
    });
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch draws" },
      { status: 500 }
    );
  }
}

// POST: Create a new draw
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      draw_month,
      draw_method,
      jackpot_amount,
      jackpot_rollover,
      status,
    } = body;

    if (
      !draw_month ||
      !draw_method ||
      jackpot_amount === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "draw_month, draw_method and jackpot_amount are required",
        },
        { status: 400 }
      );
    }

    const { data: draw, error } = await supabaseAdmin
      .from("draws")
      .insert([
        {
          draw_month,
          draw_method,
          jackpot_amount: Number(jackpot_amount),
          jackpot_rollover: Number(jackpot_rollover || 0),
          status: status || "open",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Draw creation error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Draw created successfully",
        draw,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST API error:", error);

    return NextResponse.json(
      { error: "Failed to create draw" },
      { status: 500 }
    );
  }
}