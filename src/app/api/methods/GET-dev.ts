import { NextRequest, NextResponse } from "next/server";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

const MAX_PER_MIN = 30; // Max 30 taps per minute

async function openDb() {
  return open({
    filename: "./src/lib/database.db",
    driver: sqlite3.Database,
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");
  let userId = searchParams.get("userId");

  const db = await openDb();

  if (!gameId) {
    const gamesResult = await db.all("SELECT * FROM games");
    return NextResponse.json(gamesResult, { status: 200 });
  }

  const result = await db.get("SELECT areas FROM games WHERE id = ?", [gameId]);
  const gameAreas = result ? result : null;
  if (!gameAreas) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const userIdByAddress = await db.get(
    "SELECT id FROM users WHERE address = ?",
    [searchParams.get("address") || ""]
  );
  userId = userIdByAddress ? userIdByAddress.id : userId;

  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const oneDayAgo = currentTimestamp - 86400;

  const improvementsResult = await db.all(
    "SELECT improvement FROM improvements WHERE gameId = ? AND userId = ? AND strftime('%s', createdAt) < ?",
    [gameId, userId, oneDayAgo]
  );
  const improvements = improvementsResult.map((i) => i.improvement);

  const tapsResults = await Promise.all(
    Array.from({ length: gameAreas.areas }, (_, i) =>
      db.get(
        "SELECT COUNT(*) AS taps, MIN(createdAt) AS waitFrom FROM taps WHERE gameId = ? AND userId = ? AND areaId = ? AND strftime('%s', createdAt) > ?",
        [gameId, userId, i + 1, currentTimestamp - 60]
      )
    )
  );

  const allTapsResults = await Promise.all(
    Array.from({ length: gameAreas.areas }, (_, i) =>
      db.get(
        "SELECT COUNT(*) AS taps, MIN(createdAt) AS waitFrom FROM taps WHERE gameId = $1 AND userId = $2 AND areaId = $3",
        [gameId, userId, i + 1]
      )
    )
  );

  return NextResponse.json(
    {
      improvements,
      taps: allTapsResults.map((r) => ({
        count: Number(r?.taps ?? 0),
      })),
      session: tapsResults.map((r) => ({
        count: Number(r?.taps ?? 0),
        max: MAX_PER_MIN,
        percent: Math.round(
          Number(
            ((r?.taps ?? 0) > MAX_PER_MIN ? MAX_PER_MIN : r?.taps ?? 0) /
              MAX_PER_MIN
          ) * 100
        ),
        waitFrom: new Date(r?.waitFrom ?? "0").getTime(),
      })),
    },
    { status: 200 }
  );
}
