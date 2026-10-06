import { NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recommendations";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const age = searchParams.get("age");
  if (!age) return NextResponse.json({ error: "age is required" }, { status: 400 });

  try {
    const result = await getRecommendations(age, searchParams.get("assessment") ?? undefined);
    if (!result) return NextResponse.json({ error: "no recommendations found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (e) {
    console.error("recommendations failed", e);
    return NextResponse.json({ error: "failed to load recommendations" }, { status: 500 });
  }
}
