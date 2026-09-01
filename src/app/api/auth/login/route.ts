import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const userName = email.split('@')[0] || "Manager";
    const token = "mock_token_" + Date.now();

    const user = {
      id: 1,
      name: userName.charAt(0).toUpperCase() + userName.slice(1),
      email: email,
      score: 1200,
      coins: 1000000000,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=FFD700&bold=true`
    };

    return NextResponse.json({
      message: "Login successful",
      token,
      user
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
