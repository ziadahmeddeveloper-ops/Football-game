import { NextResponse } from "next/server";
import playersData from "@/lib/players.json";

export const dynamic = 'force-dynamic';


export async function GET() {
  return NextResponse.json(playersData, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
