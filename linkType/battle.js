import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { renderBattleMap } from "../util/renderBattleMap.js";
import sharp from "sharp";

export default async function getBattleData(link, id){
  const client = createAPIClient();

  const battle = await client.battle.getById({ battleId: id });
  const battleDetails = await client.battle.getLiveBattleData({ battleId: id });
  const region = await client.region.getById({ regionId: battle.defender.region });
  const attacker = await client.country.getCountryById({ countryId: battle.attacker.country });
  const defender = await client.country.getCountryById({ countryId: battle.defender.country });


  let startTime = performance.now();

  const svg = await renderBattleMap(region.position);

  let endTime = performance.now();
  console.log(`Call to render map took ${endTime - startTime} milliseconds`);

  startTime = performance.now();

  const pngBuffer = await sharp(Buffer.from(svg, "utf8")).png().toBuffer();
  const file = new AttachmentBuilder(pngBuffer, { name: "region.png" });

  endTime = performance.now();
  console.log(`Call to create attachment took ${endTime - startTime} milliseconds`);

  const round = () => {
    if ( !battle.isActive )
      return 'La battaglia è terminata';
    return `Round ${battleDetails.battle.roundIds.length} in corso` ;
  }

  const embed = new EmbedBuilder()
  .setTitle(region.name)
  .setURL(link)
  .addFields(
    { name: '', value: ` ${defender.name}🛡️ ${battle.defender.wonRoundsCount} - ${battle.attacker.wonRoundsCount} ⚔️${attacker.name}` },
    { name: '', value: `${round()}` }
  )
  .setImage("attachment://region.png");

  return ['', embed, file]

}
