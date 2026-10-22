import { afterEach, expect, spyOn, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import * as champs from "./champs";
import { downloadAndResizeImage } from "./image-utils";

const temporaryDirectories: string[] = [];
afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(path => rm(path, { recursive: true, force: true })));
});

// Catches skipping non-contiguous skin numbers, missing loading art, cropping,
// and enlarging the narrow loading images to the requested maximum width.
test("mirrors every skin's splash and loading art without cropping or enlargement", async () => {
  const root = await mkdtemp(join(tmpdir(), "champion-art-"));
  temporaryDirectories.push(root);
  const splash = await sharp({ create: { width: 1600, height: 900, channels: 3, background: "red" } }).jpeg().toBuffer();
  const loading = await sharp({ create: { width: 308, height: 560, channels: 3, background: "blue" } }).jpeg().toBuffer();
  const server = Bun.serve({ port: 0, fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === "/cdn/test/data/en_US/champion/Ahri.json") {
      return Response.json({ data: { Ahri: { skins: [{ num: 0 }, { num: 7 }, { num: 8, parentSkin: 7 }, { num: 9, parentSkin: 0 }] } } });
    }
    if (/^\/cdn\/img\/champion\/(splash|loading)\/Ahri_(0|7)\.jpg$/.test(path)) {
      return new Response(path.includes("/splash/") ? splash : loading);
    }
    return new Response("not found", { status: 404 });
  } });
  const originalFetch = globalThis.fetch;
  const fetchSpy = spyOn(globalThis, "fetch").mockImplementation((input, init) => {
    const url = new URL(String(input));
    return originalFetch(`${server.url.origin}${url.pathname}`, init);
  });
  try {
    await champs.downloadChampionArtImages({ "103": { id: "Ahri" } }, "test", root);
    for (const skin of [0, 7]) {
      for (const kind of ["splash", "loading"]) {
        const original = kind === "splash" ? splash : loading;
        expect(Buffer.from(await Bun.file(`${root}/${kind}/full/Ahri_${skin}.jpg`).arrayBuffer())).toEqual(original);
        for (const width of [384, 768, 1280]) {
          const metadata = await sharp(`${root}/${kind}/${width}x/Ahri_${skin}.jpg`).metadata();
          expect(metadata.width).toBe(kind === "splash" ? width : 308);
          expect(metadata.height).toBe(kind === "splash" ? Math.round(width * 9 / 16) : 560);
        }
      }
    }
    expect(await Bun.file(`${root}/splash/full/Ahri_1.jpg`).exists()).toBe(false);
    expect(await Bun.file(`${root}/splash/full/Ahri_8.jpg`).exists()).toBe(false);
    expect(await Bun.file(`${root}/loading/full/Ahri_9.jpg`).exists()).toBe(false);
  } finally {
    fetchSpy.mockRestore();
    server.stop(true);
  }
});

// Catches a 404 body being persisted as a full-resolution image and uploaded.
test("does not write failed image downloads", async () => {
  const root = await mkdtemp(join(tmpdir(), "champion-art-failed-"));
  temporaryDirectories.push(root);
  const server = Bun.serve({ port: 0, fetch: () => new Response("missing", { status: 404 }) });
  try {
    await expect(downloadAndResizeImage(server.url.href, {
      basePath: root, originalSizeOutputDir: "full", fileNamesToUse: ["missing.jpg"], extraSizes: [],
    })).rejects.toThrow("404");
    expect(await Bun.file(`${root}/full/missing.jpg`).exists()).toBe(false);
  } finally {
    server.stop(true);
  }
});
