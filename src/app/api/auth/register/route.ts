import { NextResponse } from "next/server";
import { registerUser } from "@/lib/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email) {
      return NextResponse.json({ message: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    const { user, token } = registerUser(name, email, password);

    return NextResponse.json({
      message: "تم التسجيل بنجاح",
      token,
      user
    });
  } catch (error: any) {
    return NextResponse.json({ message: "فشل إنشاء الحساب" }, { status: 500 });
  }
}

