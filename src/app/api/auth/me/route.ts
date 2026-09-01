import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  
  const user = {
    id: 1,
    name: "Legend Manager",
    email: "manager@draftix.ai",
    score: 1450,
    coins: 1000000000,
    avatar: "https://ui-avatars.com/api/?name=Legend+Manager&background=1a1a2e&color=FFD700&bold=true"
  };

  return NextResponse.json({
    user,
    name: user.name,
    avatar: user.avatar,
    reward_claimed: false
  });
}
