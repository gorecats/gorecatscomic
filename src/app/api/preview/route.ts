import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "";
export async function GET(req: NextRequest) {
  try {
    const urls : string[] = [];
    for (let i = 0; i < 5; i++) {
      const paddedIndex = String(i).padStart(2, '0');
      const key = `preview/Gorecats_${paddedIndex}.jpg`; // or .png depending on your format
      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
      urls.push(url);
    }

    return NextResponse.json({ images: urls });
  } catch (err) {
    console.error("Error fetching comic pages:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}