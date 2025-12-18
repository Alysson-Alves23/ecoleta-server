const path = require('path');
const fs = require('fs');

function resolveDatabaseUrl() {
  // Preferência: DATABASE_URL (Neon recomenda) e fallback para POSTGRES_URL (templates)
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING;
}

function resolveSqliteFilename() {
  if (process.env.SQLITE_FILENAME) return process.env.SQLITE_FILENAME;
  if (process.env.VERCEL) return '/tmp/ecoleta.sqlite';
  return path.resolve(__dirname, 'src', 'database', 'database.sqlite');
}

function resolvePgConnection(databaseUrl) {
  // Neon exige SSL. O parâmetro sslmode=require na URL nem sempre é suficiente para node-postgres.
  return {
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  };
}

const databaseUrl = resolveDatabaseUrl();
const sqliteFilename = resolveSqliteFilename();
fs.mkdirSync(path.dirname(sqliteFilename), { recursive: true });

module.exports = {
  client: databaseUrl ? 'pg' : 'sqlite3',
  connection: databaseUrl ? resolvePgConnection(databaseUrl) : { filename: sqliteFilename },
  migrations: {
    directory: path.resolve(__dirname, 'src', 'database', 'migrations'),
  },
  seeds: {
    directory: path.resolve(__dirname, 'src', 'database', 'seeds'),
  },
  useNullAsDefault: true,
};
