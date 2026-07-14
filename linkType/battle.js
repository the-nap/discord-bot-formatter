import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { renderBattleMap } from "../util/renderBattleMap.js";
import sharp from "sharp";

export default async function getBattleData(link, id){
  const client = createAPIClient();

  const battle = await client.battle.getById({ battleId: id });
  const battleDetails = await client.battle.getLiveBattleData({ battleId: id });

  const defender = await client.country.getCountryById({ countryId: battle.defender.country });
  const defenderRegion = await client.region.getById({ regionId: battle.defender.region });

  const attacker = await client.country.getCountryById({ countryId: battle.attacker.country });

  let svg;
  let isRevolt;

  if(battle.attacker.region){
    isRevolt = false;
    svg = renderBattleMap([battle.defender.region, battle.attacker.region]);
  } else {
    isRevolt = true;
    svg = renderBattleMap([battle.defender.Region]);
  }

  const pngBuffer = await sharp(Buffer.from(svg, "utf8")).png().toBuffer();
  const file = new AttachmentBuilder(pngBuffer, { name: "region.png" });

  const round = () => {
    if ( !battle.isActive )
      return 'La battaglia è terminata';
    return `Round ${battleDetails.battle.roundIds.length} in corso` ;
  }

  const points = () => { 
    if(isRevolt)
      return ` ${defender.name}🛡️ ${battle.defender.wonRoundsCount} - ${battle.attacker.wonRoundsCount} ✊${attacker.name}` 
    return `${defender.name}🛡️ ${battle.defender.wonRoundsCount} - ${battle.attacker.wonRoundsCount} ⚔️${attacker.name}`

  }

  const embed = new EmbedBuilder()
  .setTitle(defenderRegion.name)
  .setURL(link)
  .addFields(
    { name: '', value: `${points()}` },
    { name: '', value: `${round()}` }
  )
  .setImage("attachment://region.png");

  return ['', embed, file]

}
