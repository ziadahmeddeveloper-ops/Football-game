import { NextResponse } from "next/server";

export async function GET(req: Request, props: { params: Promise<{ playerId: string }> | { playerId: string } }) {
  let playerId = "158023";
  try {
    const resolvedParams = await (props.params as any);
    if (resolvedParams?.playerId) {
      playerId = String(resolvedParams.playerId).replace(/[^0-9]/g, "");
    }
  } catch (e) {
    // fallback
  }

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "Player";
  const customUrl = searchParams.get("url");

  const padded = playerId.padStart(6, "0");
  const part1 = padded.slice(0, 3);
  const part2 = padded.slice(3, 6);

  // Array of candidate image URLs to try in order
  const candidateUrls: string[] = [];
  
  if (customUrl && customUrl.startsWith("http")) {
    candidateUrls.push(customUrl);
  }

  // Try Sofifa player photo endpoints across FIFA/FC editions (FC 25, 24, 23, 22, 21)
  candidateUrls.push(
    `https://cdn.sofifa.net/players/${part1}/${part2}/25_120.png`,
    `https://cdn.sofifa.net/players/${part1}/${part2}/24_120.png`,
    `https://cdn.sofifa.net/players/${part1}/${part2}/23_120.png`,
    `https://cdn.sofifa.net/players/${part1}/${part2}/22_120.png`,
    `https://cdn.sofifa.net/players/${part1}/${part2}/21_120.png`
  );

  for (const targetUrl of candidateUrls) {
    try {
      const res = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://sofifa.com/"
        },
        next: { revalidate: 86400 }
      });

      if (res.ok) {
        const buffer = await res.arrayBuffer();
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": res.headers.get("content-type") || "image/png",
            "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800"
          }
        });
      }
    } catch (err) {
      // Continue to next candidate URL
    }
  }

  // Fallback SVG badge if no external photo URL is available
  const cleanInitial = encodeURIComponent((name || "P").slice(0, 2).toUpperCase());
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <rect width="120" height="120" fill="#0d1117" rx="16"/>
    <circle cx="60" cy="45" r="24" fill="#1e293b" stroke="#FFD700" stroke-width="2"/>
    <path d="M24 105c0-20 16-32 36-32s36 12 36 32" fill="#1e293b" stroke="#FFD700" stroke-width="2"/>
    <text x="60" y="49" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFD700" text-anchor="middle">${cleanInitial}</text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400"
    }
  });
}


