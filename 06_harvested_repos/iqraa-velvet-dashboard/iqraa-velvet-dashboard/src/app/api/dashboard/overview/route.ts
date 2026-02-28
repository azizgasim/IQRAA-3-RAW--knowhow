import { NextResponse } from "next/server";
import { getDashboardOverview } from "@/lib/dashboard/overview";

export async function GET() {
  try {
    const overview = await getDashboardOverview();
    return NextResponse.json(overview);
  } catch (error) {
    console.error("[dashboard/overview]", error);
    return NextResponse.json(
      { error: "Failed to load dashboard overview" },
      { status: 500 }
    );
  }
}
