import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder } from "discord.js";
import { renderBattleMap } from "../util/renderBattleMap.js";
import { upload } from "../util/imgbbUploader.js";

export default async function getBattleData(link, id){
  const client = createAPIClient();

  const battle = await client.battle.getById({ battleId: id });
  const battleDetails = await client.battle.getLiveBattleData({ battleId: id });
  const region = await client.region.getById({ regionId: battle.defender.region });
  const attacker = await client.country.getCountryById({ countryId: battle.attacker.country });
  const defender = await client.country.getCountryById({ countryId: battle.defender.country });

  const svg = await renderBattleMap(region.position);
  const url = await upload(svg);

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
    { name: '', value: `round()` }
  )
  .setImage(url)

  return [`Battle for [${region.name}](${link})`, embed]

}
