// downloads the image to the specified path
//
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
export const downloadImage = async (url: string, path: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Image download failed (${response.status}): ${url}`);
  }
  // Download the image and save it to the specified path
  await Bun.write(path, response)
}

export const resizeImage = async (path: string, width: number, outPath: string, withoutEnlargement = false) => {
  await sharp(path).resize({ width, withoutEnlargement }).toFile(outPath);
}


export type ResizeImageOptions = {
  basePath: string;
  originalSizeOutputDir: string;
  fileNamesToUse: string[];
  withoutEnlargement?: boolean;
  extraSizes: {
    width: number;
    path: string;
  }[];
}


export const downloadAndResizeImage = async (url: string, options: ResizeImageOptions) => {
  try {
  // Download the image
  const [firstFileName, ...restFileNames] = options.fileNamesToUse;
  // Make folder if not exists
  await mkdir(`${options.basePath}/${options.originalSizeOutputDir}`, { recursive: true });
  const originalPath = `${options.basePath}/${options.originalSizeOutputDir}/${firstFileName}`;
  await downloadImage(url, originalPath);
  // Copy the original image to the other filenames
  for (const fileName of restFileNames) {
    const outPath = `${options.basePath}/${options.originalSizeOutputDir}/${fileName}`;
    await Bun.write(outPath, Bun.file(originalPath));
  }

  // Resize the image
  for (const { width, path } of options.extraSizes) {
    // Make folder if not exists
    await mkdir(`${options.basePath}/${path}`, { recursive: true });
    const resizedOutPath = `${options.basePath}/${path}/${firstFileName}`;
    await resizeImage(originalPath, width, resizedOutPath, options.withoutEnlargement);
    // Copy the resized image to the other filenames
    for (const fileName of restFileNames) {
      const copiedResizedOutPath = `${options.basePath}/${path}/${fileName}`;
      await Bun.write(copiedResizedOutPath, Bun.file(resizedOutPath));
    }
  }}
  catch(err) {
    console.log("Image Download Failed:", err);
  }
}

