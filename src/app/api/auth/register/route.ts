import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    const userName = name || email?.split('@')[0] || "Manager";
    const token = "mock_token_" + Date.now();

    const user = {
      id: Date.now(),
      name: userName,
      email: email,
      score: 1000,
      coins: 1000000000,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=FFD700&bold=true`
    };

    return NextResponse.json({
      message: "Registration successful",
      token,
      user
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Registration failed" }, { status: 500 });
  }
}
