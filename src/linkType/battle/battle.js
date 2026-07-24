import { createAPIClient } from "@wareraprojects/api";
import formatNumber from "#utils/formatNumber.js";
import { getSubscribedMu } from "./getSubscribedMus.js";
import { getAllRankings } from "./getBattleRankings.js";
import { renameDamageMap } from "./getMemberDamage.js";
import { getBattleParticipants } from "./getBattleParticipants.js";
import { getBattleMap } from "./getBattleMap.js";
import { buildBattleEmbed } from "./buildBattleEmbed.js";

const client = createAPIClient();

export default async function getBattleData({ id, context }){

  let start = performance.now();
  const muId = getSubscribedMu(context);
  let end = performance.now();
  console.log(`[getSubscribedMu] Execution time: ${end- start} ms`)

  const promises = [
    client.battle.getById({ battleId: id }),
    client.battle.getLiveBattleData({ battleId: id })
  ]
  if(muId)
    promises.push(
      client.mu.getById({ muId: muId }),
      getAllRankings([muId], { id: id, type: 'mu' }),
    );
  
  const [battle, battleDetails, mu, muDamageMap] = await Promise.all( promises );

  const rankingPromise = muId && muDamageMap.size
    ? getAllRankings(mu.members, { id: id, type: 'user', maxDamage: muDamageMap.get(muId) })
    : null;

  const participantsPromise = getBattleParticipants(battle);
  const mapPromise = getBattleMap(battle);

  const muDamage = muDamageMap.get(muId)
    ? { name: mu.name, damage: formatNumber(muDamageMap.get(muId)) }
    : null;

  const[data, file] = await Promise.all([
    participantsPromise,
    mapPromise
  ]);

  start = performance.now();

  const rankings = rankingPromise
    ? await rankingPromise
    : null;

  const membersDamage = rankings
    ? await renameDamageMap(rankings)
    : undefined;

  end = performance.now();
  console.log(`[getAllRankings(user)] Execution time: ${end- start} ms`)

  return  buildBattleEmbed({
    battle,
    battleDetails,
    membersDamage,
    muDamage,
    file,
    data
  });
}
