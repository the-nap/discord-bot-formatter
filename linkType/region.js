import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder } from "discord.js";
import { renderBattleMap } from "../util/renderBattleMap.js";
import { upload } from "../util/imgbbUploader.js";

export default async function getRegionData(link, id){
  const client = createAPIClient();
  const region = await client.region.getById({ regionId: id });

  const svg = await renderBattleMap(region.position);
  const url = await upload(svg);

  const embed = new EmbedBuilder()
  .setTitle(region.name)
  .setURL(link)
  .setImage(url)

  return [`[${region.name}](${link})`, embed]

}
