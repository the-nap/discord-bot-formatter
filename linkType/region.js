import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { renderBattleMap } from "../util/renderBattleMap.js";

export default async function getRegionData(link, id){
  const client = createAPIClient();
  const region = await client.region.getById({ regionId: id });

  let startTime = performance.now();

  const svg = await renderBattleMap(region.position);

  let endTime = performance.now();
  console.log(`Call to render map took ${endTime - startTime} milliseconds`);

  startTime = performance.now();

  const pngBuffer = await sharp(Buffer.from(svg, "utf8")).png().toBuffer();
  const file = new AttachmentBuilder(pngBuffer, { name: "region.png" });

  endTime = performance.now();
  console.log(`Call to create attachment took ${endTime - startTime} milliseconds`);

  const embed = new EmbedBuilder()
  .setTitle(region.name)
  .setURL(link)
  .setImage("attachments://region.png");

  return ['', embed, file]

}
