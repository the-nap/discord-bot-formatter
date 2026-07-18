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

  const battleType = battle.type;

  let requests = {};
  switch (battleType){
    case 'tournament':
      requests = {
        attacker: client.tournamentTeam.getById({ tournamentTeamId: battle.attacker.tournamentTeam }),
        defender: client.tournamentTeam.getById({ tournamentTeamId: battle.defender.tournamentTeam })
      };
      break;
    default:
      requests = {
        defender: client.country.getCountryById({ countryId: battle.defender.country }),
        region: client.region.getById({ regionId: battle.defender.region }),
        attacker: client.country.getCountryById({ countryId: battle.attacker.country })
      };
  }

  const data = Object.fromEntries(
    await Promise.all(
      Object.entries(requests).map(async ([key, promise]) => [
        key,
        await promise
      ])
    )
  )

  let svg;

  if(battleType === 'war'){
    svg = renderBattleMap([data.battle.defender.region, battle.attacker.region]);
  } else if( battleType === 'resistance'){
    svg = renderBattleMap([battle.defender.region]);
  }

  let file;
  if(svg){
    const pngBuffer = await sharp(Buffer.from(svg, "utf8")).png().toBuffer();
    file = new AttachmentBuilder(pngBuffer, { name: "region.png" });
  }

  const round = () => {
    if ( !battle.isActive )
      return 'La battaglia è terminata';
    return `Round ${battleDetails.battle.roundIds.length} in corso` ;
  }

  const points = () => { 
    if(battleType === 'resistance')
      return `${data.defender.name}🛡️ ${battle.defender.wonRoundsCount} - ${battle.attacker.wonRoundsCount} ✊${data.attacker.name}` 
    if(battleType === 'tournament')
      return `Team ${data.defender.number}🛡️ ${battle.defender.wonRoundsCount} - ${battle.attacker.wonRoundsCount} ⚔️Team ${data.attacker.number}`
    return `${data.defender.name}🛡️ ${battle.defender.wonRoundsCount} - ${battle.attacker.wonRoundsCount} ⚔️${data.attacker.name}`
  }

  const title = () => {
    if(battleType === 'tournament')
      return `Turno ${battle.tournamentRoundNumber}`;
    return `${data.defender.name}`;
  }


  const embed = new EmbedBuilder()
  .setTitle(title())
  .setURL(link)
  .addFields(
    { name: '', value: `${points()}` },
    { name: '', value: `${round()}` }
  )
  .setImage("attachment://region.png");

  if(file)
    return ['', embed, file];
  return['', embed];

}
