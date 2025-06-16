import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  return NextResponse.json({ otp: `${process.env.SIGN_MESSAGE}` });
}
