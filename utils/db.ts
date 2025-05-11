import { SQLiteDatabase } from "expo-sqlite";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
    const DATABASE_VERSION = 1;
    const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const currentDbVersion = versionRow?.user_version ?? 0;
  
    if (currentDbVersion >= DATABASE_VERSION) return;
  
    if (currentDbVersion === 0) {
      await db.execAsync(`
        PRAGMA journal_mode = 'wal';
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          lastUpdated TEXT NOT NULL,
          CHECK (LENGTH(TRIM(title)) > 0 OR LENGTH(TRIM(content)) > 0)
        );
      `);
    }
  
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  }
  
  