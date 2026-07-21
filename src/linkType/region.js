import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { renderBattleMap } from "#utils/renderBattleMap.js";
import sharp from "sharp";

export default async function getRegionData(link, id){
  const client = createAPIClient();

  const region = await client.region.getById({ regionId: id });

  const svg = renderBattleMap([id]);

  const pngBuffer = await sharp(Buffer.from(svg, "utf8")).png().toBuffer();
  const file = new AttachmentBuilder(pngBuffer, { name: "region.png" });

  const embed = new EmbedBuilder()
  .setTitle(region.name)
  .setURL(link)
  .setImage("attachment://region.png");

  return ['', embed, file]

}
