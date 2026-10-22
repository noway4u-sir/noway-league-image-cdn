import { downloadAndResizeImage, type ResizeImageOptions } from "./image-utils";




export const getChampionsForPatch = async (patchVersion: string) => {
  // Load champion data for the specified patch
  const champions = await fetch(`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/data/en_US/champion.json`)
    .then((response) => response.json() as any)
    .then((data) => data.data);
  return champions;
}

// Creates list of all champions with their key and name and the location of the image file for square image
export const createChampionMap = (
  champions: Record<string, { name: string; key: string; id: string; image: { full: string } }>,
  patchVersion: string,
) => {
  return Object.fromEntries(Object.values(champions).map(champion => [
    champion.key,
    {
      name: champion.name,
      key: champion.key,
      id: champion.id,
      image: `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${champion.image.full}`,
    },
  ]));
}


export const downloadChampionSquareImagesNew = async (championMap: any) => {
  const resizeConfig: Partial<ResizeImageOptions> = {
    basePath: './images/champions/square',
    originalSizeOutputDir: 'original',
    extraSizes: [
      { width: 64, path: '64x' },
      { width: 32, path: '32x' },
      { width: 16, path: '16x' },
    ]
  }
  await Promise.all(Object.values(championMap).map(async (champion: any) => {
    const namesToUse = [`${champion.key}.png`, `${champion.id}.png`];
    const config = { ...resizeConfig, fileNamesToUse: namesToUse } as ResizeImageOptions;
    const downloadUrl = champion.image;
    await downloadAndResizeImage(downloadUrl, config);
  }))

}


// Skin numbers are not contiguous; use the patch's champion detail metadata.
export const downloadChampionArtImages = async (
  championMap: Record<string, { id: string }>,
  patchVersion: string,
  basePath = "./images/champions",
) => {
  for (const champion of Object.values(championMap)) {
    const response = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/data/en_US/champion/${champion.id}.json`,
    );
    if (!response.ok) {
      throw new Error(`Champion metadata download failed (${response.status}): ${champion.id}`);
    }
    const details = await response.json() as {
      data: Record<string, { skins: { num: number; parentSkin?: number }[] }>;
    };
    for (const skin of details.data[champion.id].skins) {
      // Chromas share the parent's art and have no standalone image in Data Dragon.
      if (skin.parentSkin !== undefined) continue;
      for (const kind of ["splash", "loading"]) {
        const name = champion.id.toLocaleLowerCase() === 'fiddlesticks' ? 'FiddleSticks' : champion.id;
        const fileName = `${name}_${skin.num}.jpg`;
        await downloadAndResizeImage(
          `https://ddragon.leagueoflegends.com/cdn/img/champion/${kind}/${fileName}`,
          {
            basePath: `${basePath}/${kind}`,
            originalSizeOutputDir: "full",
            fileNamesToUse: [fileName],
            withoutEnlargement: true,
            extraSizes: [
              { width: 384, path: "384x" },
              { width: 768, path: "768x" },
              { width: 1280, path: "1280x" },
            ],
          },
        );
      }
    }
  }
};
