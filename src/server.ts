import express from "express";
import routes from "./routes";
import cors from "cors";
import { errors } from "celebrate";
import { uploadsFolder, copyItemsImages } from "./config/multer";

// Copia imagens dos items para /tmp/uploads na Vercel
copyItemsImages();

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.use("/uploads", express.static(uploadsFolder));

app.use(errors());

const port = Number(process.env.PORT) || 3333;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
