import formatNumber from "#utils/formatNumber.js";
import { getSubscribedMu } from "./getSubscribedMus.js";
import { getAllRankings } from "./getBattleRankings.js";
import { renameDamageMap } from "./getMemberDamage.js";
import { buildPromises, getBattleParticipants } from "./getBattleParticipants.js";
import { getBattleMap } from "./getBattleMap.js";
import { buildBattleEmbed } from "./buildBattleEmbed.js";

export default async function getBattleData({ id , context }) {

  const battleId = id;
  const muId = await getSubscribedMu(context);

  const promises = buildPromises(muId, battleId);

  const [battle, battleDetails, mu, muDamageMap] = await Promise.all(promises);

  const muDamage = muDamageMap?.get(muId)
    ? {
        name: mu.name,
        damage: formatNumber(muDamageMap.get(muId))
      }
    : null;

  const rankingPromise = muId && muDamageMap.size
    ? getAllRankings(mu.members, {
        battleId,
        type: 'user',
        maxDamage: muDamageMap.get(muId)
      })
    : null;

  const [data, file] = await Promise.all([
    getBattleParticipants(battle),
    getBattleMap(battle)
  ]);

  const initial = buildBattleEmbed({
    battle,
    battleDetails,
    membersDamage: undefined,
    muDamage,
    file,
    data
  });

  if (!rankingPromise)
    return initial;

  return {
    ...initial,
    update: async () => {
      const rankings = await rankingPromise;
      const membersDamage = await renameDamageMap(rankings);

      return buildBattleEmbed({
        battle,
        battleDetails,
        membersDamage,
        muDamage,
        file,
        data
      });
    }
  };
}
