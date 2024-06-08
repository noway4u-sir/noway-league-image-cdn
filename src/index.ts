import { createChampionMap, downloadChampionSquareImagesNew, getChampionsForPatch } from "./champs";
import { downloadAndResizeItemImage, downloadItemsForPatch } from "./items";
import { downloadAndResizeMasteryImage, downloadMasteriesForPatch, mapRunesReforgedResponseToImageInfo } from "./masteries";
import { uploadImagesFolder } from "./r2";
import { downloadRanks } from "./ranks";
import { downloadAndResizeSummonerSpellImage, downloadSummonerSpellsForPatch } from "./summoners";



export const getPatchInfo = async () => {
  // Load latest patch info from the riot lol API
  const latestVersion = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
    .then((response) => response.json() as any)
    .then((data) => data[0]);
  return latestVersion;
}
const patchVersion = await getPatchInfo();

export const downloadChampionSquareImages = async () => {


  const champions = await getChampionsForPatch(patchVersion);
  const championMap = createChampionMap(champions, patchVersion);
  await downloadChampionSquareImagesNew(championMap);
}

export const downloadItems = async () => {
  const items = await downloadItemsForPatch(patchVersion);
  await downloadAndResizeItemImage(items, patchVersion);
}

export const downloadSummonerSpells = async () => {
  const summonerSpells = await downloadSummonerSpellsForPatch(patchVersion);
  await downloadAndResizeSummonerSpellImage(summonerSpells, patchVersion);
}

export const downloadMasteries = async () => {

  const runes = await downloadMasteriesForPatch(patchVersion);
  const runesReforgedImageInfo = mapRunesReforgedResponseToImageInfo(runes);
  await downloadAndResizeMasteryImage(runesReforgedImageInfo, patchVersion);
}


await Promise.all([
  downloadChampionSquareImages(),
  downloadItems(),
  downloadSummonerSpells(),
  downloadMasteries(),
  downloadRanks()
])

await uploadImagesFolder()

