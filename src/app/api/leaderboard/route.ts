import { NextResponse } from "next/server";

export async function GET() {
  const leaderboard = [
    { rank: 1, name: "Pep Guardiola AI", score: 2890, matches: 142, wins: 120, win_rate: "84.5%", avatar: "https://ui-avatars.com/api/?name=Pep+Guardiola&background=0052FF&color=fff" },
    { rank: 2, name: "Carlo Ancelotti AI", score: 2750, matches: 130, wins: 105, win_rate: "80.7%", avatar: "https://ui-avatars.com/api/?name=Carlo+Ancelotti&background=FFD700&color=000" },
    { rank: 3, name: "Zinedine Zidane", score: 2610, matches: 118, wins: 92, win_rate: "77.9%", avatar: "https://ui-avatars.com/api/?name=Zinedine+Zidane&background=111&color=fff" },
    { rank: 4, name: "Mikel Arteta AI", score: 2480, matches: 110, wins: 82, win_rate: "74.5%", avatar: "https://ui-avatars.com/api/?name=Mikel+Arteta&background=E60000&color=fff" },
    { rank: 5, name: "Jurgen Klopp AI", score: 2390, matches: 105, wins: 76, win_rate: "72.3%", avatar: "https://ui-avatars.com/api/?name=Jurgen+Klopp&background=C8102E&color=fff" },
    { rank: 6, name: "Legend Manager (You)", score: 1450, matches: 24, wins: 18, win_rate: "75.0%", avatar: "https://ui-avatars.com/api/?name=You&background=FFD700&color=000" }
  ];

  return NextResponse.json({
    leaderboard,
    current_user_rank: 6,
    current_user_score: 1450
  });
}
