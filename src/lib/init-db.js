import { open } from "sqlite";
import sqlite3 from "sqlite3";

async function setup() {
  const db = await open({
    filename: "./tapnee.db",
    driver: sqlite3.Database,
  });

  await db.exec("DROP TABLE IF EXISTS users");
  await db.exec("DROP TABLE IF EXISTS games");
  await db.exec("DROP TABLE IF EXISTS taps");
  await db.exec("DROP TABLE IF EXISTS improvements");
  await db.exec("DROP TABLE IF EXISTS addresses");

  await db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tgId INTEGER DEFAULT 0,
      tonWallet TEXT DEFAULT "",
      createdAt INTEGER DEFAULT 0
    );
  `);

  await db.exec(`
    CREATE TABLE games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER DEFAULT 0,
      name TEXT DEFAULT "",
      areas INTEGER DEFAULT 0,
      metadata TEXT DEFAULT "",
      createdAt INTEGER DEFAULT 0
    );
  `);

  await db.exec(`
    CREATE TABLE taps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gameId INTEGER DEFAULT 0,
      userId INTEGER DEFAULT 0,
      areaId INTEGER DEFAULT 0,
      createdAt INTEGER DEFAULT 0
    );
  `);

  await db.exec(`
    CREATE TABLE improvements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gameId INTEGER DEFAULT 0,
      userId INTEGER DEFAULT 0,
      improvement INTEGER DEFAULT 0,
      createdAt INTEGER DEFAULT 0
    );
  `);

  await db.exec(`
    CREATE TABLE addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER DEFAULT 0,
      address TEXT DEFAULT "",
      createdAt INTEGER DEFAULT 0
    );
  `);

  await db.run(
    "INSERT INTO users (tgId, tonWallet, createdAt) VALUES (1, '0:000', 0)"
  );

  await db.run(
    "INSERT INTO games (userId, name, areas, metadata, createdAt) VALUES (1, 'PINATA', 1, '{}', 0)"
  );
  await db.run(
    "INSERT INTO games (userId, name, areas, metadata, createdAt) VALUES (1, 'BUTT', 2, '{}', 0)"
  );

  await db.close();
}

setup().catch(console.error);
