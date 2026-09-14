import { NextResponse } from "next/server";
import { getUserByEmail, registerUser } from "@/lib/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = getUserByEmail(cleanEmail);

    if (!existingUser) {
      return NextResponse.json({ message: "هذا الحساب غير مسجل! يرجى إنشاء حساب جديد أولاً" }, { status: 401 });
    }

    if (existingUser.password && existingUser.password !== password) {
      return NextResponse.json({ message: "كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    return NextResponse.json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: existingUser
    });
  } catch (error: any) {
    return NextResponse.json({ message: "فشل تسجيل الدخول" }, { status: 500 });
  }
}

