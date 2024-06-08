import { downloadAndResizeImage, type ResizeImageOptions } from "./image-utils";




export const getChampionsForPatch = async (patchVersion: string) => {
  // Load champion data for the specified patch
  const champions = await fetch(`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/data/en_US/champion.json`)
    .then((response) => response.json() as any)
    .then((data) => data.data);
  return champions;
}

// Creates list of all champions with their key and name and the location of the image file for square image
export const createChampionMap = (champions: any, patchVersion: string) => {
  const championMap = Object.values(champions).reduce((acc: any, champion: any) => {
    acc[champion.key] = {
      name: champion.name,
      key: champion.key,
      id: champion.id,
      image: `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${champion.image.full}`,
    };
    return acc;
  }, {});
  return championMap;
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

