import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: "Match recorded successfully",
      new_score: 1470
    });
  } catch (error: any) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
