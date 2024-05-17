import { open } from "sqlite";
import sqlite3 from "sqlite3";

async function setup() {
  const db = await open({
    filename: "./src/lib/database.db",
    driver: sqlite3.Database,
  });

  try {
    await db.exec("DROP TABLE IF EXISTS improvements");
    await db.exec("DROP TABLE IF EXISTS taps");
    await db.exec("DROP TABLE IF EXISTS games");
    await db.exec("DROP TABLE IF EXISTS users");

    await db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT NOT NULL UNIQUE,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.exec(`
      CREATE TABLE games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        areas INTEGER NOT NULL,
        metadata TEXT NOT NULL DEFAULT '{}',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);

    await db.exec(`
      CREATE TABLE taps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gameId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        areaId INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (gameId) REFERENCES games(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);

    await db.exec(`
      CREATE TABLE improvements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gameId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        improvement INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (gameId) REFERENCES games(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);

    await db.run("INSERT INTO users (address) VALUES ('0Q0')");
    await db.run(
      "INSERT INTO games (userId, name, areas, metadata) VALUES (1, 'PINATA', 1, '{}')"
    );
    await db.run(
      "INSERT INTO games (userId, name, areas, metadata) VALUES (1, 'BUTT', 2, '{}')"
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await db.close();
  }
}

setup().catch(console.error);
