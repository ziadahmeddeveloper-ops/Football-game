import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, avatar } = body;

    const userName = name || email?.split('@')[0] || "Manager";
    const token = "google_token_" + Date.now();

    const user = {
      id: Date.now(),
      name: userName,
      email: email,
      score: 1200,
      coins: 1000000000,
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=FFD700&bold=true`
    };

    return NextResponse.json({
      message: "Google login successful",
      token,
      user
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Google login failed" }, { status: 500 });
  }
}
