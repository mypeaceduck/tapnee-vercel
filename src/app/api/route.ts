import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

const THROTTLE_TIME = 200;
const MIN = 60_000;
const MAX_PER_MIN = 30;

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});

async function connectClient() {
  await client.connect();
}

connectClient().catch(console.error);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");
  let userId = searchParams.get("userId");
  const address = searchParams.get("address");
  const timestamp = new Date().getTime();

  try {
    if (!gameId) {
      const gamesResult = await client.query(`SELECT * FROM games`);
      return NextResponse.json(gamesResult.rows, { status: 200 });
    }

    if (!userId) {
      const userResult = await client.query(
        `SELECT userId FROM addresses WHERE address = $1`,
        [address]
      );
      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].userid;
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    const areaResult = await client.query(
      `SELECT areas FROM games WHERE id = $1`,
      [gameId]
    );

    if (areaResult.rows.length === 0) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const improvementsResult = await client.query(
      `SELECT improvement FROM improvements WHERE gameId = $1 AND userId = $2 AND createdAt + 86400000 < $3`,
      [gameId, userId, timestamp]
    );
    const imp =
      improvementsResult.rows.length > 0
        ? improvementsResult.rows.map((i) => Number(i.improvement))
        : [0];

    const timeAreasPromises = Array.from(
      { length: areaResult.rows[0].areas },
      (_, i) =>
        client.query(
          `SELECT COUNT(*) AS slaps, MIN(createdAt) AS waitFrom FROM taps WHERE gameId = $1 AND userId = $2 AND areaId = $3 AND createdAt > $4`,
          [gameId, userId, i + 1, timestamp - MIN]
        )
    );
    const timeSlapsResults = await Promise.all(timeAreasPromises);

    const allAreasPromises = Array.from(
      { length: areaResult.rows[0].areas },
      (_, i) =>
        client.query(
          `SELECT COUNT(*) AS slaps FROM taps WHERE gameId = $1 AND userId = $2 AND areaId = $3`,
          [gameId, userId, i + 1]
        )
    );
    const allSlapsResults = await Promise.all(allAreasPromises);

    return NextResponse.json(
      {
        stats: allSlapsResults.map((s) => ({
          count: Number(s.rows[0].slaps),
        })),
        session: timeSlapsResults.map((s) => ({
          count: Number(s.rows[0].slaps),
          max: MAX_PER_MIN,
          percent: Math.round(
            ((Number(s.rows[0].slaps) > MAX_PER_MIN
              ? MAX_PER_MIN
              : Number(s.rows[0].slaps)) /
              MAX_PER_MIN) *
              100
          ),
          waitFrom: Number(s.rows[0].waitfrom),
        })),
        improvement: imp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const timestamp = new Date().getTime();
    const data = await request.json();
    const { gameId, areaId, address, auth } = data;
    let userId = data.userId;

    if (auth) {
      const existsResult = await client.query(
        `SELECT id FROM addresses WHERE address = $1`,
        [auth]
      );
      if (existsResult.rows.length === 0) {
        const userResult = await client.query(
          `INSERT INTO users (tgId, createdAt) VALUES ($1, $2) RETURNING id`,
          [1, timestamp]
        );
        await client.query(
          `INSERT INTO addresses (userId, address, createdAt) VALUES ($1, $2, $3)`,
          [userResult.rows[0].id, auth, timestamp]
        );
      }

      return NextResponse.json({ userId, address: auth }, { status: 200 });
    }

    if (!userId) {
      const userResult = await client.query(
        `SELECT userId FROM addresses WHERE address = $1`,
        [address]
      );
      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].userid;
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    const lastEntryResult = await client.query(
      `SELECT MAX(createdAt) as lastTimestamp FROM taps WHERE gameId = $1 AND userId = $2 AND areaId = $3`,
      [gameId, userId, areaId]
    );

    if (
      lastEntryResult.rows.length > 0 &&
      timestamp - lastEntryResult.rows[0].lasttimestamp < THROTTLE_TIME
    ) {
      return NextResponse.json({ error: "Click too soon" }, { status: 429 });
    }

    const improvementsResult = await client.query(
      `SELECT improvement FROM improvements WHERE gameId = $1 AND userId = $2 AND createdAt + 86400000 < $3`,
      [gameId, userId, timestamp]
    );
    const imp =
      improvementsResult.rows.length > 0
        ? improvementsResult.rows.map((i) => Number(i.improvement))
        : [0];

    const countSlapsResult = await client.query(
      `SELECT COUNT(*) as countSlaps FROM taps WHERE gameId = $1 AND userId = $2 AND areaId = $3 AND createdAt > $4`,
      [gameId, userId, areaId, timestamp - MIN]
    );

    if (
      countSlapsResult.rows.length > 0 &&
      countSlapsResult.rows[0].countslaps >
        (imp.includes(2) ? MAX_PER_MIN * 10 : MAX_PER_MIN)
    ) {
      return NextResponse.json({ error: "Click limit" }, { status: 429 });
    }

    if (imp.includes(1)) {
      await client.query(
        `INSERT INTO taps (gameId, userId, areaId, createdAt) VALUES ($1, $2, $3, $4)`,
        [gameId, userId, areaId, timestamp]
      );
    }

    await client.query(
      `INSERT INTO taps (gameId, userId, areaId, createdAt) VALUES ($1, $2, $3, $4)`,
      [gameId, userId, areaId, timestamp]
    );

    return NextResponse.json({ message: "Click incremented" }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error updating data" }, { status: 500 });
  }
}
