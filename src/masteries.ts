

// file for getting the masteries images / runes
//

import { downloadAndResizeImage } from "./image-utils";

//
export const downloadMasteriesForPatch = async (patch: string): Promise<RunesReforgedResponse> => {
  // Download the masteries for the patch
  const masteries = await fetch(`https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/runesReforged.json`).then(res => res.json());
  return masteries as RunesReforgedResponse;
}

export type PartialMasteryResponse = {
  data: MasteryDataMap
}

export type MasteryDataMap = {
  [key: string]: MasteryInformation
}

export type MasteryInformation = {
  name: string;
  description: string;
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

export const downloadAndResizeMasteryImage = async (runesReforgedImageInfo: RunesReforgedImageInfo[], patch: string = '14.11.0') => {
  await Promise.all(runesReforgedImageInfo.map(async rune => {
    const url = `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`;
    console.log(url)
    const options = {
      basePath: "./images/masteries",
      originalSizeOutputDir: "full",
      fileNamesToUse: [`${rune.id}.png`, `${rune.key}.png`],
      extraSizes: [
        { width: 32, path: "32x" },
      ]
    }
    await downloadAndResizeImage(url, options);
  }));
}

export const mapRunesReforgedResponseToImageInfo = (runes: RunesReforgedResponse): RunesReforgedImageInfo[] => {

  const items: RunesReforgedImageInfo[] = [];
  // 
  items.push(...runes.map(rune => {
    return {
      id: rune.id.toString(),
      key: rune.key,
      icon: rune.icon
    }
  }));
  // Now iterate over each rune and add all the "slots" to the items array
  runes.forEach(rune => {
    rune.slots.forEach(slot => {
      slot.runes.forEach(rune => {
        items.push({
          id: rune.id.toString(),
          key: rune.key,
          icon: rune.icon
        });
      });
    });
  });
  return items;
}



export type RunesReforgedImageInfo = {
  id: string
  key: string
  icon: string
}
export type RunesReforgedResponse = RunesReforgedRootItem[]

export interface RunesReforgedRootItem {
  id: number
  key: string
  icon: string
  name: string
  slots: Slot[]
}

export interface Slot {
  runes: Rune[]
}

export interface Rune {
  id: number
  key: string
  icon: string
  name: string
  shortDesc: string
  longDesc: string
}

//  TODO: Download stat mods, because they are not included in the runes reforged response - for whatever reason
