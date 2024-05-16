import { Client } from "pg";

async function setup() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  await client.connect();

  await client.query("DROP TABLE IF EXISTS users");
  await client.query("DROP TABLE IF EXISTS games");
  await client.query("DROP TABLE IF EXISTS taps");
  await client.query("DROP TABLE IF EXISTS improvements");
  await client.query("DROP TABLE IF EXISTS addresses");

  await client.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      tgId INTEGER DEFAULT 0,
      tonWallet TEXT DEFAULT '',
      createdAt INTEGER DEFAULT 0
    );
  `);

  await client.query(`
    CREATE TABLE games (
      id SERIAL PRIMARY KEY,
      userId INTEGER DEFAULT 0,
      name TEXT DEFAULT '',
      areas INTEGER DEFAULT 0,
      metadata TEXT DEFAULT '',
      createdAt INTEGER DEFAULT 0
    );
  `);

  await client.query(`
    CREATE TABLE taps (
      id SERIAL PRIMARY KEY,
      gameId INTEGER DEFAULT 0,
      userId INTEGER DEFAULT 0,
      areaId INTEGER DEFAULT 0,
      createdAt INTEGER DEFAULT 0
    );
  `);

  await client.query(`
    CREATE TABLE improvements (
      id SERIAL PRIMARY KEY,
      gameId INTEGER DEFAULT 0,
      userId INTEGER DEFAULT 0,
      improvement INTEGER DEFAULT 0,
      createdAt INTEGER DEFAULT 0
    );
  `);

  await client.query(`
    CREATE TABLE addresses (
      id SERIAL PRIMARY KEY,
      userId INTEGER DEFAULT 0,
      address TEXT DEFAULT '',
      createdAt INTEGER DEFAULT 0
    );
  `);

  await client.query(
    "INSERT INTO users (tgId, tonWallet, createdAt) VALUES (1, '0:000', 0)"
  );

  await client.query(
    "INSERT INTO games (userId, name, areas, metadata, createdAt) VALUES (1, 'PINATA', 1, '{}', 0)"
  );
  await client.query(
    "INSERT INTO games (userId, name, areas, metadata, createdAt) VALUES (1, 'BUTT', 2, '{}', 0)"
  );

  await client.end();
}

setup().catch(console.error);
