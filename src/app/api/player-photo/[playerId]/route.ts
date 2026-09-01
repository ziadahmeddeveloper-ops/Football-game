import { NextResponse } from "next/server";

export async function GET(req: Request, props: { params: Promise<{ playerId: string }> }) {
  const params = await props.params;
  const playerId = params?.playerId?.replace(/[^0-9]/g, "") || "158023";
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "Player";

  const padded = playerId.padStart(6, "0");
  const part1 = padded.slice(0, 3);
  const part2 = padded.slice(3, 6);

  const primaryUrl = `https://cdn.sofifa.net/players/${part1}/${part2}/22_120.png`;
  
  return NextResponse.redirect(primaryUrl, {
    headers: {
      "Cache-Control": "public, max-age=86400"
    }
  });
}
