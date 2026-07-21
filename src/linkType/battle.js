import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { renderBattleMap } from "#utils/renderBattleMap.js";
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

  const data = await resolveRequests(requests);

  let svg;

  if(battleType === 'war'){
    svg = renderBattleMap([battle.defender.region, battle.attacker.region]);
  } else if( battleType === 'resistance'){
    svg = renderBattleMap([battle.defender.region]);
  }

  let file;
  if(svg){
    const pngBuffer = await sharp(Buffer.from(svg, "utf8")).png().toBuffer();
    file = new AttachmentBuilder(pngBuffer, { name: "region.png" });
  }

  const left = battleType === "tournament"
    ? `Team ${data.defender.number}`
    : data.defender.name;

  const right = battleType === "tournament"
    ? `Team ${data.attacker.number}`
    : data.attacker.name;

  const icon = battleType === "resistance" ? "✊" : "⚔️";
  
  const points =
    `${left} 🛡️  ${battle.defender.wonRoundsCount} - ${battle.attacker.wonRoundsCount}  ${icon} ${right}`;

  const title = battleType === "tournament"
    ? `Turno ${battle.tournamentRoundNumber}`
    : data.region.name;

  const round = !battle.isActive
    ? "La battaglia è terminata"
    : `Round ${battleDetails.battle.roundIds.length} in corso`;


  const embed = new EmbedBuilder()
  .setTitle(title)
  .setURL(link)
  .addFields(
    { name: '', value: points },
    { name: '', value: round }
  )
  .setImage("attachment://region.png");

  if(file)
    return ['', embed, file];
  return['', embed];
}

async function resolveRequests(requests) {
    return Object.fromEntries(
        await Promise.all(
            Object.entries(requests).map(async ([k, p]) => [k, await p])
        )
    );
}
