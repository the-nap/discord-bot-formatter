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

  const rankingPromise = muId && muDamage?.[muId]
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

  const battleContext = {
    battle,
    battleDetails,
    muDamage,
    file,
    data 
  }

  const initial = buildBattleEmbed(battleContext);

  if (!rankingPromise)
    return initial;

  return {
    ...initial,
    update: async (current) => {
      battleContext.rankings = await rankingPromise;

      const updated = buildBattleEmbed(battleContext);

      updated.embed.setURL(current.embed.data.url);
      updated.embed.setDescription(current.embed.data.description ?? null)
      return updated;
    }
  };
}
