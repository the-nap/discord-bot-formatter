import { getSubscribedMu } from "./getSubscribedMus.js";
import { getAllRankings } from "./getBattleRankings.js";
import { buildPromises, getBattleParticipants } from "./getBattleParticipants.js";
import { getBattleMap } from "./getBattleMap.js";
import { buildBattleEmbed } from "./buildBattleEmbed.js";

export default async function getBattleData({ id , context }) {

  const battleId = id;
  const muId = await getSubscribedMu(context);

  const promises = buildPromises(muId, battleId);

  const [battle, battleDetails, mu, muDamage] = await Promise.all(promises);

  const rankingPromise = muId && muDamage
    ? getAllRankings(mu.members, {
        battleId,
        type: 'user',
        maxDamage: muDamage[muId].damage
      })
    : null;

  const [data, file] = await Promise.all([
    getBattleParticipants(battle),
    getBattleMap(battle)
  ]);

  const initial = buildBattleEmbed({
    battle,
    battleDetails,
    rankings: undefined,
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

      return buildBattleEmbed({
        battle,
        battleDetails,
        rankings,
        muDamage,
        file,
        data
      });
    }
  };
}
