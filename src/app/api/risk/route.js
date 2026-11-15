import { NextResponse } from "next/server";
import { analyzeRisk } from "../../lib/riskEngine";

export async function POST(request) {
  try {
    const body = await request.json();

    const { current, baseline } = body;

    if (!current || !baseline) {
      return NextResponse.json(
        {
          success: false,
          error: "Current and baseline data are required.",
        },
        {
          status: 400,
        }
      );
    }

    const result = analyzeRisk(current, baseline);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Risk analysis error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to analyze risk.",
      },
      {
        status: 500,
      }
    );
  }
}