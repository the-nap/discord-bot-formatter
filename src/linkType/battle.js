import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { renderBattleMap } from "#utils/renderBattleMap.js";
import subscriptions from '#state/subscriptions.json' with { type:'json' }
import sharp from "sharp";
import formatNumber from "#utils/formatNumber.js";

const client = createAPIClient();

export default async function getBattleData({ id, context }){

  const muId = subscriptions
    .filter(
      (item) =>
        item.guild === context.guild &&
        item.channel === context.channel )
    .map( item => item?.mu )[0];

  console.log(muId);
  const promises = [
    client.battle.getById({ battleId: id }),
    client.battle.getLiveBattleData({ battleId: id })
  ]
  if(muId)
    promises.push(
      client.battleRanking.getRanking({ 'battleId': id, 'type': 'mu', 'side': 'merged', 'dataType': 'damage' }),
      client.battleRanking.getRanking({ 'battleId': id, 'type': 'user', 'side': 'merged', 'dataType': 'damage' }),
      client.mu.getById({ muId: muId })
    );
  
  const [battle, battleDetails, battleRankingsMu, battleRankingUsers, mu] = await Promise.all( promises );

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

  const fields = [
    { name: '', value: points },
    { name: '', value: round },
  ]

  const muDamage = muId
  ? battleRankingsMu.items
    .filter( item => item.mu === muId )
    .map( ranking => formatNumber(ranking.value) )[0]
  : 0

  if(muDamage)
    fields.push({ name:`----Danni----`, value: `${mu.name}   ${muDamage}` })

  const nameAndDamage = muId && muDamage
  ? (await getDamage(battleRankingUsers, mu.members)).filter(item => item.value > 0).map(item => `${item.name}:  ${formatNumber(item.value)}`).join('\n')
  : null

  if(nameAndDamage)
    fields.push({ name:'Classifica', value: nameAndDamage });

  const embed = new EmbedBuilder()
  .setTitle(title)
  .addFields(
    fields
  )
  if(file){
    embed.setImage("attachment://region.png");
    return {embed, file};
  }

  return {embed};
}

async function resolveRequests(requests) {
    return Object.fromEntries(
        await Promise.all(
            Object.entries(requests).map(async ([k, p]) => [k, await p])
        )
    );
}

async function getDamage(battleRankingUsers, muMembers){

  let membersNames = await Promise.all(
    muMembers.map(async (member) => {
      const user = await client.user.getUserLite({ userId: member });
      return {
        id: member,
        name: user.username
      };
    })
  );

  console.log(battleRankingUsers);
  const rankingMap = new Map(
    battleRankingUsers.items.map(r => [r.user, r.value ?? 0])
  );

  console.log(rankingMap);
  return membersNames.map(( user ) => ({
    name: user.name,
    value: rankingMap.get(user.id) ?? 0
  }));

}
