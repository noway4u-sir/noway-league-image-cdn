// downloads the image to the specified path
//
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
export const downloadImage = async (url: string, path: string) => {
  const response = await fetch(url);
  // Download the image and save it to the specified path
  await Bun.write(path, response)
}

export const resizeImage = async (path: string, width: number, outPath: string) => {
  await sharp(path).resize(width).toFile(outPath);
}


export type ResizeImageOptions = {
  basePath: string;
  originalSizeOutputDir: string;
  fileNamesToUse: string[];
  extraSizes: {
    width: number;
    path: string;
  }[];
}


export const downloadAndResizeImage = async (url: string, options: ResizeImageOptions) => {
  // Download the image
  const [firstFileName, ...restFileNames] = options.fileNamesToUse;
  // Make folder if not exists
  await mkdir(`${options.basePath}/${options.originalSizeOutputDir}`, { recursive: true }).catch(console.error);
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
    await mkdir(`${options.basePath}/${path}`, { recursive: true }).catch(console.error);
    const resizedOutPath = `${options.basePath}/${path}/${firstFileName}`;
    await resizeImage(originalPath, width, resizedOutPath);
    // Copy the resized image to the other filenames
    for (const fileName of restFileNames) {
      const copiedResizedOutPath = `${options.basePath}/${path}/${fileName}`;
      await Bun.write(copiedResizedOutPath, Bun.file(resizedOutPath));
    }
  }
}

