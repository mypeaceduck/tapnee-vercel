import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function setup() {
  const client = await pool.connect();

  try {
    await client.query("DROP TABLE IF EXISTS improvements");
    await client.query("DROP TABLE IF EXISTS taps");
    await client.query("DROP TABLE IF EXISTS games");
    await client.query("DROP TABLE IF EXISTS users");

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        address TEXT NOT NULL UNIQUE,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE games (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        areas INTEGER NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}',
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);

    await client.query(`
      CREATE TABLE taps (
        id SERIAL PRIMARY KEY,
        gameId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        areaId INTEGER NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (gameId) REFERENCES games(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);

    await client.query(`
      CREATE TABLE improvements (
        id SERIAL PRIMARY KEY,
        gameId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        improvement INTEGER NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (gameId) REFERENCES games(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);

    await db.run("INSERT INTO users (address) VALUES ('0Q0')");
    await client.query(
      "INSERT INTO games (userId, name, areas, metadata) VALUES (1, 'PINATA', 1, '{}')"
    );
    await client.query(
      "INSERT INTO games (userId, name, areas, metadata) VALUES (1, 'BUTT', 2, '{}')"
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    client.release();
  }
}

setup().catch(console.error);
