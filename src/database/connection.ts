import knex from "knex";
import path from "path";
import fs from "fs";

function resolveSqliteFilename() {
  // Em ambientes serverless (ex.: Vercel), o filesystem do cÃ³digo Ã© somente-leitura.
  // Use /tmp (gravÃ¡vel) ou configure explicitamente via SQLITE_FILENAME.
  if (process.env.SQLITE_FILENAME) return process.env.SQLITE_FILENAME;
  if (process.env.VERCEL) return "/tmp/ecoleta.sqlite";

  // ExecuÃ§Ã£o local/dev: usa o caminho padrÃ£o ao lado deste arquivo.
  return path.resolve(__dirname, "database.sqlite");
}

const sqliteFilename = resolveSqliteFilename();

// Garante que o diretÃ³rio existe (necessÃ¡rio quando apontar para volumes/caminhos customizados)
fs.mkdirSync(path.dirname(sqliteFilename), { recursive: true });

const connection = knex({
  client: "sqlite3",
  connection: {
    filename: sqliteFilename,
  },
  useNullAsDefault: true,
});

export default connection;
