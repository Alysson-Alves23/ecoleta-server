const path = require('path');
const fs = require('fs');

function resolveSqliteFilename() {
  if (process.env.SQLITE_FILENAME) return process.env.SQLITE_FILENAME;
  if (process.env.VERCEL) return '/tmp/ecoleta.sqlite';
  return path.resolve(__dirname, 'src', 'database', 'database.sqlite');
}

const sqliteFilename = resolveSqliteFilename();
fs.mkdirSync(path.dirname(sqliteFilename), { recursive: true });

module.exports = {
  client: 'sqlite3',
  connection: {
    filename: sqliteFilename,
  },
  migrations: {
    directory: path.resolve(__dirname, 'src', 'database', 'migrations'),
  },
  seeds: {
    directory: path.resolve(__dirname, 'src', 'database', 'seeds'),
  },
  useNullAsDefault: true,
};
