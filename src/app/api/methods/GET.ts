import { query } from "@/lib/db";
import { GameArea, Improvement, TapRecord, User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

const THROTTLE_TIME = 200; // 200ms between taps
const MIN = 60_000; // 60,000ms or 1 minute
const MAX_PER_MIN = 30; // Max 30 taps per minute

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");
  let userId = searchParams.get("userId");

  if (!gameId) {
    const gamesResult = await query("SELECT * FROM games");
    return NextResponse.json(gamesResult.rows, { status: 200 });
  }

  const result = await query<GameArea>(
    "SELECT areas FROM games WHERE id = $1",
    [gameId]
  );
  const gameAreas = result.rows.length > 0 ? result.rows[0] : null;
  if (!gameAreas) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const userIdByAddress = await query<User>(
    "SELECT id FROM users WHERE address = $1",
    [searchParams.get("address") || ""]
  );
  userId =
    userIdByAddress.rows.length > 0 ? userIdByAddress.rows[0].id : userId;

  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();
  const oneDayAgo = new Date(now);
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const improvementsResult = await query<Improvement>(
    "SELECT improvement FROM improvements WHERE gameId = $1 AND userId = $2 AND createdAt < $3",
    [gameId, userId, oneDayAgo.toISOString()]
  );
  const improvements = improvementsResult.rows.map((i) => i.improvement);

  const tapsResults = await Promise.all(
    Array.from({ length: gameAreas.areas }, (_, i) =>
      query<TapRecord>(
        "SELECT COUNT(*) AS taps, MIN(createdAt) AS waitFrom FROM taps WHERE gameId = $1 AND userId = $2 AND areaId = $3 AND createdAt > NOW() - INTERVAL '1 minute'",
        [gameId, userId, i + 1]
      )
    )
  );

  const allTapsResults = await Promise.all(
    Array.from({ length: gameAreas.areas }, (_, i) =>
      query<TapRecord>(
        "SELECT COUNT(*) AS taps, MIN(createdAt) AS waitFrom FROM taps WHERE gameId = $1 AND userId = $2 AND areaId = $3",
        [gameId, userId, i + 1]
      )
    )
  );

  return NextResponse.json(
    {
      improvements,
      taps: allTapsResults.map((r) => ({
        count: Number(r?.rows?.[0]?.taps ?? 0),
      })),
      session: tapsResults.map((r) => ({
        count: Number(r?.rows?.[0]?.taps ?? 0),
        max: MAX_PER_MIN,
        percent: Math.round(
          ((Number(r?.rows?.[0]?.taps ?? 0) > MAX_PER_MIN
            ? MAX_PER_MIN
            : Number(r?.rows?.[0]?.taps ?? 0)) /
            MAX_PER_MIN) *
            100
        ),
        waitFrom: new Date(r.rows[0].waitFrom ?? "0").getTime(),
      })),
    },
    { status: 200 }
  );
}
