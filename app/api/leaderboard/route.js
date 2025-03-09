import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.goated.com/user/affiliate/referral-leaderboard/OQID5MA");
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch remote data" }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

