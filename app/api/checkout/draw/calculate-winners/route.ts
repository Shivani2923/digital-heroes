import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = supabaseAdmin;

    // 1. Get the latest published draw
    const { data: draw, error: drawError } = await supabase
      .from("draws")
      .select(
        `
        id,
        draw_month,
        winning_numbers,
        jackpot_amount,
        status
        `
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (drawError) {
      console.error("Draw loading error:", drawError.message);

      return NextResponse.json(
        {
          error: "Unable to load draw",
        },
        { status: 500 }
      );
    }

    if (!draw) {
      return NextResponse.json(
        {
          error: "No published draw found",
        },
        { status: 404 }
      );
    }

    if (
      !draw.winning_numbers ||
      !Array.isArray(draw.winning_numbers) ||
      draw.winning_numbers.length !== 5
    ) {
      return NextResponse.json(
        {
          error: "Winning numbers are missing or invalid",
        },
        { status: 400 }
      );
    }

    const winningNumbers = draw.winning_numbers.map(Number);

    // 2. Get all entries for this draw
    const { data: entries, error: entriesError } = await supabase
      .from("draw_entries")
      .select(
        `
        id,
        draw_id,
        user_id,
        entry_numbers
        `
      )
      .eq("draw_id", draw.id);

    if (entriesError) {
      console.error("Entries loading error:", entriesError.message);

      return NextResponse.json(
        {
          error: "Unable to load draw entries",
        },
        { status: 500 }
      );
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({
        message: "No entries found for this draw",
        winners: [],
      });
    }

    // 3. Prevent duplicate winner calculation
    const { data: existingWinners, error: existingError } = await supabase
      .from("draw_winners")
      .select("id")
      .eq("draw_id", draw.id)
      .limit(1);

    if (existingError) {
      console.error(
        "Existing winners check error:",
        existingError.message
      );

      return NextResponse.json(
        {
          error: "Unable to check existing winners",
        },
        { status: 500 }
      );
    }

    if (existingWinners && existingWinners.length > 0) {
      return NextResponse.json(
        {
          error: "Winner calculation has already been completed for this draw",
        },
        { status: 409 }
      );
    }

    // 4. Find matching numbers
    const calculatedWinners: {
      draw_id: number;
      user_id: string;
      entry_id: number;
      matched_numbers: number;
      prize_tier: string;
      prize_amount: number;
    }[] = [];

    for (const entry of entries) {
      const entryNumbers = Array.isArray(entry.entry_numbers)
        ? entry.entry_numbers.map(Number)
        : [];

      const matchedNumbers = entryNumbers.filter((number: number) =>
        winningNumbers.includes(number)
      ).length;

      let prizeTier = "";
      let prizePercentage = 0;

      if (matchedNumbers === 5) {
        prizeTier = "jackpot";
        prizePercentage = 40;
      } else if (matchedNumbers === 4) {
        prizeTier = "second";
        prizePercentage = 35;
      } else if (matchedNumbers === 3) {
        prizeTier = "third";
        prizePercentage = 25;
      }

      if (matchedNumbers >= 3) {
        calculatedWinners.push({
          draw_id: draw.id,
          user_id: entry.user_id,
          entry_id: entry.id,
          matched_numbers: matchedNumbers,
          prize_tier: prizeTier,
          prize_amount:
            (Number(draw.jackpot_amount ?? 0) * prizePercentage) / 100,
        });
      }
    }

    // 5. Count winners in each category
    const jackpotWinners = calculatedWinners.filter(
      (winner) => winner.matched_numbers === 5
    );

    const secondTierWinners = calculatedWinners.filter(
      (winner) => winner.matched_numbers === 4
    );

    const thirdTierWinners = calculatedWinners.filter(
      (winner) => winner.matched_numbers === 3
    );

    // 6. Split each prize category equally
    const finalWinners = calculatedWinners.map((winner) => {
      let totalCategoryPrize = 0;
      let categoryWinnerCount = 1;

      if (winner.matched_numbers === 5) {
        totalCategoryPrize = Number(draw.jackpot_amount ?? 0) * 0.4;
        categoryWinnerCount = jackpotWinners.length;
      } else if (winner.matched_numbers === 4) {
        totalCategoryPrize = Number(draw.jackpot_amount ?? 0) * 0.35;
        categoryWinnerCount = secondTierWinners.length;
      } else if (winner.matched_numbers === 3) {
        totalCategoryPrize = Number(draw.jackpot_amount ?? 0) * 0.25;
        categoryWinnerCount = thirdTierWinners.length;
      }

      return {
        ...winner,
        prize_amount:
          categoryWinnerCount > 0
            ? Number(
                (totalCategoryPrize / categoryWinnerCount).toFixed(2)
              )
            : 0,
      };
    });

    // 7. Save winners
    if (finalWinners.length > 0) {
      const { error: insertError } = await supabase
        .from("draw_winners")
        .insert(finalWinners);

      if (insertError) {
        console.error("Winner insert error:", insertError.message);

        return NextResponse.json(
          {
            error: "Unable to save winner records",
            details: insertError.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Winner calculation completed successfully",
      draw_id: draw.id,
      total_entries: entries.length,
      total_winners: finalWinners.length,
      winners: finalWinners,
    });
  } catch (error) {
    console.error("Winner calculation error:", error);

    return NextResponse.json(
      {
        error: "Unexpected server error",
      },
      { status: 500 }
    );
  }
}

