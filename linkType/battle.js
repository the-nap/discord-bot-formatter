import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { renderBattleMap } from "../util/renderBattleMap.js";
import sharp from "sharp";

export default async function getBattleData(link, id){
  const client = createAPIClient();

  
  const [battle, battleDetails] = await Promise.all([
    client.battle.getById({ battleId: id }),
    client.battle.getLiveBattleData({ battleId: id })
  ]);
 
  const [defender, defenderRegion, attacker] = await Promise.all([
    client.country.getCountryById({ countryId: battle.defender.country }),
    client.region.getById({ regionId: battle.defender.region }),
    client.country.getCountryById({ countryId: battle.attacker.country })
  ]);

  let svg;
  let isRevolt;

  if(battle.attacker.region){
    isRevolt = false;
    svg = renderBattleMap([battle.defender.region, battle.attacker.region]);
  } else {
    isRevolt = true;
    svg = renderBattleMap([battle.defender.region]);
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
      return ` ${defender.name}🛡️ ${battle.defender.wonRoundsCount} - ${battle.attacker.wonRoundsCount} ✊${attacker.name}  ` 
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
