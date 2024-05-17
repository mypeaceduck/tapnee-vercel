import { query } from "@/lib/db";
import { Improvement, TapInput, User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

const THROTTLE_TIME = 200; // 200ms between taps
const MIN = 60_000; // 60,000ms or 1 minute
const MAX_PER_MIN = 30; // Max 30 taps per minute

export async function POST(request: NextRequest) {
  const data = (await request.json()) as TapInput;
  const { gameId, areaId, address, auth } = data;
  let userId = data.userId;

  const userIdByAddress = await query<User>(
    "SELECT id FROM users WHERE address = $1",
    [address || ""]
  );
  userId = userIdByAddress.rows.length > 0 ? userIdByAddress.rows[0].id : "";

  if (auth && !userId) {
    const timestamp = Date.now();
    const userInsertResult = await query<{ id: string }>(
      "INSERT INTO users (address, createdAt) VALUES ($1, $2) RETURNING id",
      [address, timestamp]
    );
    userId = userInsertResult.rows[0].id;
  }

  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const timestamp = Date.now();

  // Throttling logic to prevent too frequent taps
  const lastEntryResult = await query<{ lastTimestamp: number }>(
    "SELECT MAX(createdAt) as lastTimestamp FROM taps WHERE gameId = $1 AND userId = $2 AND areaId = $3",
    [gameId, userId, areaId]
  );
  if (
    lastEntryResult.rows.length > 0 &&
    timestamp - lastEntryResult.rows[0].lastTimestamp < THROTTLE_TIME
  ) {
    return NextResponse.json({ error: "Click too soon" }, { status: 429 });
  }

  // Fetch improvements and apply click limits
  const improvementsResult = await query<Improvement>(
    "SELECT improvement FROM improvements WHERE gameId = $1 AND userId = $2 AND createdAt + 86400000 < $3",
    [gameId, userId, timestamp]
  );
  const improvements = improvementsResult.rows.map((i) => i.improvement);

  const countSlapsResult = await query<{ countSlaps: number }>(
    "SELECT COUNT(*) as countSlaps FROM taps WHERE gameId = $1 AND userId = $2 AND areaId = $3 AND createdAt > $4",
    [gameId, userId, areaId, timestamp - MIN]
  );

  const slapLimit = improvements.includes(2) ? MAX_PER_MIN * 10 : MAX_PER_MIN;
  if (
    countSlapsResult.rows.length > 0 &&
    countSlapsResult.rows[0].countSlaps >= slapLimit
  ) {
    return NextResponse.json({ error: "Click limit reached" }, { status: 429 });
  }

  // Insert a new tap
  await query(
    "INSERT INTO taps (gameId, userId, areaId, createdAt) VALUES ($1, $2, $3, $4)",
    [gameId, userId, areaId, timestamp]
  );

  return NextResponse.json(
    { message: "Click incremented", userId: userId },
    { status: 200 }
  );
}
