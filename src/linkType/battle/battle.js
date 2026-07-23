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
  if(muId.length)
    promises.push(
      client.mu.getById({ muId: muId[0] }),
      getAllRankings(muId, { id: id, type: 'mu' }),
    );
  
  start = performance.now();
  const [battle, battleDetails, mu, muDamageMap] = await Promise.all( promises );

  end = performance.now();
  console.log(`[first api fetch] Execution time: ${end- start} ms`)


  start = performance.now();
  let membersDamage;
  if(muId.length){
    membersDamage = await renameDamageMap(
      await getAllRankings(mu.members, { id: id, type: 'user', maxDamage: muDamageMap.get(muId[0]) })
    )
  }
  end = performance.now();
  console.log(`[getAllRankings(user)] Execution time: ${end- start} ms`)


  const muDamage = mu
    ? { name: mu.name, damage: formatNumber(muDamageMap.get(muId[0])) }
    : null;

  start = performance.now();
  end = performance.now();
  console.log(`[getNamingFetch] Execution time: ${end - start} ms`)

  start = performance.now();
  const data = await getBattleParticipants(battle);
  end = performance.now();
  console.log(`[getBattleParticipants] Execution time: ${end- start} ms`)

  start = performance.now();
  const file = await getBattleMap(battle);
  end = performance.now();
  console.log(`[getBattleMap] Execution time: ${end- start} ms`)

  return  buildBattleEmbed({
    battle,
    battleDetails,
    membersDamage,
    muDamage,
    file,
    data
  });
}
