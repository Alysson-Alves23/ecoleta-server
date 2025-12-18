import express from "express";
import routes from "./routes";
import path from "path";
import cors from "cors";
import { errors } from "celebrate";
import { ensureDatabaseReady } from "./database/bootstrap";

const app = express();

app.set("trust proxy", true);

app.use(cors());
app.use(express.json());
app.use(routes);

app.use("/uploads", express.static(path.resolve(__dirname, "..", "uploads")));

app.use(errors());

const port = Number(process.env.PORT) || 3333;

(async () => {
  try {
    await ensureDatabaseReady();
    app.listen(port);
  } catch (err) {
    console.error("Falha ao preparar banco (migrations/seed):", err);
    process.exit(1);
  }
})();
