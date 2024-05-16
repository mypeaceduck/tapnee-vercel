import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

const dbPath = join(process.cwd(), "./tapnee.db");
const THROTTLE_TIME = 200;
const MIN = 60_000;
const MAX_PER_MIN = 30;

export async function GET(request: NextRequest) {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");
  let userId = searchParams.get("userId");
  const address = searchParams.get("address");
  const timestamp = new Date().getTime();

  try {
    if (!gameId) {
      const games = await db.all(`SELECT * FROM games`);
      return NextResponse.json(games, { status: 200 });
    }

    if (!userId) {
      const user = await db.get(
        `SELECT userId FROM addresses WHERE address = ?`,
        [address]
      );
      if (user) {
        userId = user.userId;
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    const areaResult = await db.get(`SELECT areas FROM games WHERE id = ?`, [
      gameId,
    ]);

    if (!areaResult) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const improvements = await db.all(
      `SELECT improvement FROM improvements WHERE gameId = ? AND userId = ? AND createdAt + 86400000 < ?`,
      [gameId, userId, timestamp]
    );
    const imp = improvements
      ? improvements.map((i) => Number(i.improvement))
      : [0];

    const timeAreas = Array.from({ length: areaResult.areas }, (_, i) =>
      db.get(
        `SELECT COUNT(*) AS slaps, MIN(createdAt) AS waitFrom FROM taps WHERE gameId = ? AND userId = ? AND areaId = ? AND createdAt > ?`,
        [gameId, userId, i + 1, timestamp - MIN]
      )
    );
    const timeSlaps = await Promise.all(timeAreas);

    const allAreas = Array.from({ length: areaResult.areas }, (_, i) =>
      db.get(
        `SELECT COUNT(*) AS slaps FROM taps WHERE gameId = ? AND userId = ? AND areaId = ?`,
        [gameId, userId, i + 1]
      )
    );
    const allSlaps = await Promise.all(allAreas);

    return NextResponse.json(
      {
        stats: allSlaps.map((s) => ({
          count: Number(s.slaps),
        })),
        session: timeSlaps.map((s) => ({
          count: Number(s.slaps),
          max: MAX_PER_MIN,
          percent: Math.round(
            ((Number(s.slaps) > MAX_PER_MIN ? MAX_PER_MIN : Number(s.slaps)) /
              MAX_PER_MIN) *
              100
          ),
          waitFrom: Number(s.waitFrom),
        })),
        improvement: imp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  } finally {
    await db.close();
  }
}

export async function POST(request: NextRequest) {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  try {
    const timestamp = new Date().getTime();
    const data = await request.json();
    const { gameId, areaId, address, auth } = data;
    let userId = data.userId;

    if (auth) {
      const exists = await db.get(
        `SELECT id FROM addresses WHERE address = ?`,
        [auth]
      );
      if (!exists) {
        const id = await db.run(
          `INSERT INTO users (tgId, createdAt) VALUES (?, ?)`,
          [1, timestamp]
        );
        await db.run(
          `INSERT INTO addresses (userId, address, createdAt) VALUES (?, ?, ?)`,
          [id.lastID, auth, timestamp]
        );
      }

      return NextResponse.json({ userId, address: auth }, { status: 200 });
    }

    if (!userId) {
      const user = await db.get(
        `SELECT userId FROM addresses WHERE address = ?`,
        [address]
      );
      console.log(user, address);
      if (user) {
        userId = user.userId;
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    const lastEntry = await db.get(
      `SELECT MAX(createdAt) as lastTimestamp FROM taps WHERE gameId = ? AND userId = ? AND areaId = ?`,
      [gameId, userId, areaId]
    );

    if (lastEntry && timestamp - lastEntry.lastTimestamp < THROTTLE_TIME) {
      return NextResponse.json({ error: "Click too soon" }, { status: 429 });
    }

    const improvements = await db.all(
      `SELECT improvement FROM improvements WHERE gameId = ? AND userId = ? AND createdAt + 86400000 < ?`,
      [gameId, userId, timestamp]
    );
    const imp = improvements
      ? improvements.map((i) => Number(i.improvement))
      : [0];

    const countSlaps = await db.get(
      `SELECT COUNT(*) as countSlaps FROM taps WHERE gameId = ? AND userId = ? AND areaId = ? AND createdAt > ?`,
      [gameId, userId, areaId, timestamp - MIN]
    );

    if (
      countSlaps &&
      countSlaps.countSlaps > (imp.includes(2) ? MAX_PER_MIN * 10 : MAX_PER_MIN)
    ) {
      return NextResponse.json({ error: "Click limit" }, { status: 429 });
    }

    if (imp.includes(1)) {
      await db.run(
        `INSERT INTO taps (gameId, userId, areaId, createdAt) VALUES (?, ?, ?, ?)`,
        [gameId, userId, areaId, timestamp]
      );
    }

    await db.run(
      `INSERT INTO taps (gameId, userId, areaId, createdAt) VALUES (?, ?, ?, ?)`,
      [gameId, userId, areaId, timestamp]
    );

    return NextResponse.json({ message: "Click incremented" }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error updating data" }, { status: 500 });
  } finally {
    await db.close();
  }
}
