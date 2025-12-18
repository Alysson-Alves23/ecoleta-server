import path from "path";
import connection from "./connection";

let dbReadyPromise: Promise<void> | null = null;

/**
 * Garante que as migrations e o seed foram executados.
 * Em ambientes serverless, isso roda no cold start (quando a instância sobe).
 */
export function ensureDatabaseReady(): Promise<void> {
  if (dbReadyPromise) return dbReadyPromise;

  dbReadyPromise = (async () => {
    const migrationsDir = path.resolve(__dirname, "migrations");
    const seedsDir = path.resolve(__dirname, "seeds");

    await connection.migrate.latest({ directory: migrationsDir });
    await connection.seed.run({ directory: seedsDir });
  })();

  return dbReadyPromise;
}


