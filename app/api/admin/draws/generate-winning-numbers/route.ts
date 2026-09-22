import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { draw_id } = await request.json();

    if (!draw_id) {
      return NextResponse.json(
        { error: "draw_id is required" },
        { status: 400 }
      );
    }

    // Get the selected draw
    const { data: draw, error: drawError } = await supabaseAdmin
      .from("draws")
      .select("id, status, winning_numbers")
      .eq("id", draw_id)
      .single();

    if (drawError || !draw) {
      return NextResponse.json(
        { error: "Draw not found" },
        { status: 404 }
      );
    }

    if (draw.status !== "open") {
      return NextResponse.json(
        {
          error: "Only open draws can generate winning numbers",
        },
        { status: 400 }
      );
    }

    if (
      draw.winning_numbers &&
      Array.isArray(draw.winning_numbers) &&
      draw.winning_numbers.length > 0
    ) {
      return NextResponse.json(
        {
          error: "Winning numbers have already been generated",
        },
        { status: 409 }
      );
    }

    // Generate five unique numbers from 1 to 45
    const winningNumbers: number[] = [];

    while (winningNumbers.length < 5) {
      const randomNumber = Math.floor(Math.random() * 45) + 1;

      if (!winningNumbers.includes(randomNumber)) {
        winningNumbers.push(randomNumber);
      }
    }

    winningNumbers.sort((a, b) => a - b);

    // Save winning numbers and publish the draw
    const { data: updatedDraw, error: updateError } =
      await supabaseAdmin
        .from("draws")
        .update({
          winning_numbers: winningNumbers,
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", draw_id)
        .select()
        .single();

    if (updateError) {
      console.error("Winning number update error:", updateError);

      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Winning numbers generated successfully",
      draw: updatedDraw,
    });
  } catch (error) {
    console.error("Generate winning numbers error:", error);

    return NextResponse.json(
      { error: "Failed to generate winning numbers" },
      { status: 500 }
    );
  }
}