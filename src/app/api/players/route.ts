import { NextResponse } from "next/server";
import playersData from "@/lib/players.json";

export const dynamic = 'force-dynamic';

export async function GET() {
  const formatted = (playersData as any[]).map(p => ({
    id: p.id,
    name: p.name,
    rating: p.rating,
    pos: p.pos || p.position || "CM",
    position: p.pos || p.position || "CM",
    club: p.club || "Free Agent",
    nat: p.nat || p.nationality || "World",
    nationality: p.nat || p.nationality || "World",
    img_url: p.img_url || `/api/player-photo/${p.id}?name=${encodeURIComponent(p.name)}`,
    image: `/api/player-photo/${p.id}?name=${encodeURIComponent(p.name)}&url=${encodeURIComponent(p.img_url || '')}`,
    local_image: `/api/player-photo/${p.id}?name=${encodeURIComponent(p.name)}&url=${encodeURIComponent(p.img_url || '')}`,
    is_legend: Boolean(p.is_legend)
  }));

  return NextResponse.json(formatted, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600"
    }
  });
}

