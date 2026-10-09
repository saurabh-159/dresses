import { NextRequest, NextResponse } from "next/server";
import { searchSuggestions } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q") || "";
    const suggestions = await searchSuggestions(query);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load search suggestions." }, { status: 500 });
  }
}
