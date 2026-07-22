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
    .map( item => item?.mu );

  console.log(muId);
  const promises = [
    client.battle.getById({ battleId: id }),
    client.battle.getLiveBattleData({ battleId: id })
  ]
  if(muId.length)
    promises.push(
      client.mu.getById({ muId: muId[0] }),
      getAllRankings(muId, { id: id, type: 'mu' }),
    );
  
  const [battle, battleDetails, mu, muDamageMap] = await Promise.all( promises );

  const battleType = battle.type;

  let membersDamage;
  if(muId.length){
    membersDamage = await getAllRankings(mu.members, { id: id, type: 'user' })
  }

  const muDamage = mu
    ? { name: mu.name, damage: formatNumber(muDamageMap.get(muId[0])) }
    : null;

  const usersToFetch = [...membersDamage.keys()].map( user => 
    client.user.getUserLite({ userId: user })
  )

  const fetchedUsers = await Promise.all(usersToFetch);

  const renamed = new Map();
  
  for (const user of fetchedUsers) {
    renamed.set(user.username, membersDamage.get(user._id));
  }
  membersDamage = renamed;

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

  if(muDamage)
    fields.push({ name:`----Danni----`, value: `${mu.name} ${muDamage.damage}` })

  const membersDamageData = [...membersDamage.entries()]
    .sort((a,b) => {
      return b[1] - a[1]
    })
    .map((user) => {
      return `${user[0]} - ${formatNumber(user[1])}`
    })
    .join('\n');

  fields.push({ name:'', value: membersDamageData })

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
            Object.entries(requests).map(([k, p]) =>
                p.then(result => [k, result])
            )
        )
    );
}

// returns map with { key: id, value: damage }
async function getAllRankings(toSearch, rankingData){

  const toSearchIds = new Set(toSearch);
  let cursor;

  let matching = new Map();

  while(true) {
    const response = await client.battleRanking.getRanking({ 'battleId': rankingData.id, 'type': rankingData.type, 'side': 'merged', 'dataType': 'damage', 'cursor': cursor });
    for( let item of response.items ){
      if(item.value < 50000)
        return matching;
      const id = item.mu ?? item.user;
      if(toSearchIds.has(id))
        matching.set(id, item.value);
    }

    if(matching.size === toSearchIds.size)
      return matching;

    if(!response.nextCursor) {
      return matching;
    }

    cursor = response.nextCursor;
  }
}
