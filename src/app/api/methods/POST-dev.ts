import { NextRequest, NextResponse } from "next/server";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

const THROTTLE_TIME = 200; // 200ms between taps
const MIN = 60_000; // 60,000ms or 1 minute
const MAX_PER_MIN = 30; // Max 30 taps per minute

// Open SQLite database
async function openDb() {
  return open({
    filename: "./src/lib/database.db",
    driver: sqlite3.Database,
  });
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { gameId, areaId, address } = data;
  let userId = data.userId;

  const db = await openDb();

  const userIdByAddress = address
    ? await db.get("SELECT id FROM users WHERE address = ?", [address])
    : null;
  userId = userIdByAddress?.id ?? userId;

  if (address && !userId) {
    const userInsertResult = await db.run(
      "INSERT INTO users (address) VALUES (?)",
      [address]
    );
    return NextResponse.json(
      { message: "New User Id", userId: userInsertResult.lastID },
      { status: 200 }
    );
  }

  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!areaId) {
    return NextResponse.json({ error: "Click not found" }, { status: 404 });
  }

  const timestamp = Date.now();

  const lastEntryResult = await db.get(
    "SELECT MAX(strftime('%s', createdAt)) as lastTimestamp FROM taps WHERE gameId = ? AND userId = ? AND areaId = ?",
    [gameId, userId, areaId]
  );
  if (
    lastEntryResult &&
    timestamp / 1000 - lastEntryResult.lastTimestamp < THROTTLE_TIME / 1000
  ) {
    return NextResponse.json({ error: "Click too soon" }, { status: 429 });
  }

  const improvementsResult = await db.all(
    "SELECT improvement FROM improvements WHERE gameId = ? AND userId = ? AND strftime('%s', createdAt) < ?",
    [gameId, userId, timestamp / 1000 - 86400]
  );
  const improvements = improvementsResult.map((i) => i.improvement);

  const countSlapsResult = await db.get(
    "SELECT COUNT(*) as countSlaps FROM taps WHERE gameId = ? AND userId = ? AND areaId = ? AND strftime('%s', createdAt) > ?",
    [gameId, userId, areaId, timestamp / 1000 - MIN / 1000]
  );

  const slapLimit = improvements.includes(2) ? MAX_PER_MIN * 10 : MAX_PER_MIN;
  if (countSlapsResult && countSlapsResult.countSlaps >= slapLimit) {
    return NextResponse.json({ error: "Click limit reached" }, { status: 429 });
  }

  await db.run("INSERT INTO taps (gameId, userId, areaId) VALUES (?, ?, ?)", [
    gameId,
    userId,
    areaId,
  ]);

  return NextResponse.json(
    { message: "Click incremented", userId: userId },
    { status: 200 }
  );
}
