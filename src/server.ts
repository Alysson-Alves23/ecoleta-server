import express from "express";
import routes from "./routes";
import cors from "cors";
import { errors } from "celebrate";
import { uploadsFolder } from "./config/multer";

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.use("/uploads", express.static(uploadsFolder));

app.use(errors());

app.listen(3333);
