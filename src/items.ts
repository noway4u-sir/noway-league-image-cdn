
// download list of items

import { downloadAndResizeImage } from "./image-utils";

export const downloadAndResizeItemImage = async (items: PartialItemResponse, patch: string = '14.11.0') => {
  const itemData = items.data;
  await Promise.all(Object.keys(itemData).map(async key => {

    const item = itemData[key];
    const url = `https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/${item.image.full}`;
    const options = {
      basePath: "./images/items/square",
      originalSizeOutputDir: "full",
      fileNamesToUse: [`${key}.png`],
      extraSizes: [
        { width: 32, path: "32x" },
      ]
    }
    await downloadAndResizeImage(url, options);
  }));
}



export const downloadItemsForPatch = async (patch: string): Promise<PartialItemResponse> => {
  // Download the items for the patch
  const items = await fetch(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/item.json`).then(res => res.json());
  return items as PartialItemResponse;
}




export type PartialItemResponse = {
  data: ItemDataMap
}

export type ItemDataMap = {
  [key: string]: ItemInformation
}

export type ItemInformation = {
  name: string;
  description: string;
  plaintext: string;
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }
}




