import { NextResponse } from "next/server";
import { registerUser } from "@/lib/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, avatar } = body;

    if (!email) {
      return NextResponse.json({ message: "حساب الجيميل غير صالح" }, { status: 400 });
    }

    const { user, token } = registerUser(name, email, undefined, avatar);

    return NextResponse.json({
      message: "تم تسجيل الدخول بواسطة Google بنجاح",
      token,
      user
    });
  } catch (error: any) {
    return NextResponse.json({ message: "فشل المصادقة عبر Google" }, { status: 500 });
  }
}

