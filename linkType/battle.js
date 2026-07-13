import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { renderBattleMap } from "../util/renderBattleMap.js";

export default async function getBattleData(link, id){
  const client = createAPIClient();

  const battle = await client.battle.getById({ battleId: id });
  const region = await client.region.getById({ regionId: battle.defender.region });

  const svg = await renderBattleMap(region.position);
  const attachment = new AttachmentBuilder(Buffer.from(svg), { name: 'battle-map.svg' });

  const embed = new EmbedBuilder()
  .setTitle(region.name)
  .setURL(link)
  .setImage('attachment://battle-map.svg')

  return [`Battle for ${region.name}`, embed, attachment]

}
