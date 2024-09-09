

// we have to download the ranks from community dragon

import { downloadAndResizeImage } from "./image-utils"

//
const baseUrl = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/images"

const unrankedUrl = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/unranked-emblem.png"
const getRankEmblemUrl = (rank: string) => {
  return `${baseUrl}/${rank.toLowerCase()}.png`
}

const ranks = [
  "Unranked",
  "Iron",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Emerald",
  "Diamond",
  "Master",
  "Grandmaster",
  "Challenger"
]

export const downloadRanks = async () => {
  await Promise.all(ranks.map(async rank => {
    const url = getRankEmblemUrl(rank);
    const options = {
      basePath: "./images/ranks",
      originalSizeOutputDir: "full",
      fileNamesToUse: [`${rank.toLowerCase()}.png`, `${rank.toUpperCase()}.png`],
      extraSizes: [
        { width: 32, path: "32x" },
        { width: 64, path: "64x" },
      ]
    }
    await downloadAndResizeImage(url, options);
  }));
}
