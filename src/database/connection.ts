import knex from "knex";
import path from "path";
import fs from "fs";

function resolveDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING
  );
}

function resolveSqliteFilename() {
  // Em ambientes serverless (ex.: Vercel), o filesystem do código é somente-leitura.
  // Use /tmp (gravável) ou configure explicitamente via SQLITE_FILENAME.
  if (process.env.SQLITE_FILENAME) return process.env.SQLITE_FILENAME;
  if (process.env.VERCEL) return "/tmp/ecoleta.sqlite";

  // Execução local/dev: usa o caminho padrão ao lado deste arquivo.
  return path.resolve(__dirname, "database.sqlite");
}

function resolvePgConnection(databaseUrl: string) {
  // Neon exige SSL. O parâmetro sslmode=require na URL nem sempre é suficiente para node-postgres.
  return {
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  };
}

const databaseUrl = resolveDatabaseUrl();
const sqliteFilename = resolveSqliteFilename();

// Garante que o diretório existe (necessário quando apontar para volumes/caminhos customizados)
fs.mkdirSync(path.dirname(sqliteFilename), { recursive: true });

const connection = knex({
  client: databaseUrl ? "pg" : "sqlite3",
  connection: databaseUrl
    ? resolvePgConnection(databaseUrl)
    : { filename: sqliteFilename },
  useNullAsDefault: true,
});

export default connection;
