import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

export const uploadsFolder = process.env.VERCEL
  ? "/tmp/uploads"
  : path.resolve(__dirname, "..", "..", "uploads");

// Garante que o diretório exista (Vercel permite escrita apenas em /tmp)
fs.mkdirSync(uploadsFolder, { recursive: true });

export default {
  storage: multer.diskStorage({
    destination: uploadsFolder,
    filename(request, file, callback) {
      const hash = crypto.randomBytes(6).toString("hex");
      const filename = `${hash}-${file.originalname}`;
      callback(null, filename);
    },
  }),
};
