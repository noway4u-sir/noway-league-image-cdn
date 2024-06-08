// download the summoner spells
//
//
//

import { downloadAndResizeImage } from "./image-utils";

//
export const downloadSummonerSpellsForPatch = async (patch: string): Promise<PartialSummonerSpellResponse> => {
  // Download the summoner spells for the patch
  const spells = await fetch(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/summoner.json`).then(res => res.json());
  return spells as PartialSummonerSpellResponse;
}

export type PartialSummonerSpellResponse = {
  data: SummonerSpellDataMap
}

export type SummonerSpellDataMap = {
  [key: string]: SummonerSpellInformation
}

export type SummonerSpellInformation = {
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


export const downloadAndResizeSummonerSpellImage = async (spells: PartialSummonerSpellResponse, patch: string = '14.11.0') => {
  const spellData = spells.data;
  await Promise.all(Object.keys(spellData).map(async key => {

    const spell = spellData[key];
    const url = `https://ddragon.leagueoflegends.com/cdn/${patch}/img/spell/${spell.image.full}`;
    const options = {
      basePath: "./images/spells",
      originalSizeOutputDir: "full",
      fileNamesToUse: [`${key}.png`],
      extraSizes: [
        { width: 32, path: "32x" },
      ]
    }
    await downloadAndResizeImage(url, options);
  }));

}
