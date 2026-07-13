import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder } from "discord.js";
import { renderBattleMap } from "../util/renderBattleMap.js";
import { upload } from "../util/imgbbUploader.js";

export default async function getBattleData(link, id){
  const client = createAPIClient();

  const battle = await client.battle.getById({ battleId: id });
  const region = await client.region.getById({ regionId: battle.defender.region });

  const svg = await renderBattleMap(region.position);
  const url = await upload(svg);

  const embed = new EmbedBuilder()
  .setTitle(region.name)
  .setURL(link)
  .setImage(url)

  return [`Battle for ${region.name}`, embed]

}
