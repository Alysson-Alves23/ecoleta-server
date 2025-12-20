import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";

export const uploadsFolder = process.env.VERCEL
  ? "/tmp/uploads"
  : path.resolve(__dirname, "..", "..", "uploads");

// Garante que o diretório exista (Vercel permite escrita apenas em /tmp)
fs.mkdirSync(uploadsFolder, { recursive: true });

// Imagens dos items que devem estar disponíveis
const itemsImages = [
  "lampadas.svg",
  "baterias.svg",
  "papeis-papelao.svg",
  "eletronicos.svg",
  "organicos.svg",
  "oleo.svg",
];

/**
 * Copia as imagens dos items para o diretório de uploads (necessário na Vercel)
 */
export function copyItemsImages() {
  if (!process.env.VERCEL) {
    // Em desenvolvimento local, as imagens já estão no lugar certo
    return;
  }

  // Na Vercel, o código compilado está em /var/task/
  // Precisamos copiar de /var/task/uploads para /tmp/uploads
  const sourceDir = "/var/task/uploads";
  const targetDir = uploadsFolder;

  itemsImages.forEach((imageName) => {
    const sourcePath = path.join(sourceDir, imageName);
    const targetPath = path.join(targetDir, imageName);

    try {
      if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copiado ${imageName} para ${targetDir}`);
      } else if (!fs.existsSync(sourcePath)) {
        // Tenta caminho relativo ao código TypeScript (caso não esteja compilado)
        const altSourcePath = path.resolve(__dirname, "..", "..", "uploads", imageName);
        if (fs.existsSync(altSourcePath) && !fs.existsSync(targetPath)) {
          fs.copyFileSync(altSourcePath, targetPath);
          console.log(`Copiado ${imageName} de caminho alternativo para ${targetDir}`);
        }
      }
    } catch (error) {
      console.error(`Erro ao copiar ${imageName}:`, error);
    }
  });
}

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
