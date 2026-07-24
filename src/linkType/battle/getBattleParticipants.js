import { createAPIClient } from "@wareraprojects/api";
import { getAllRankings } from "./getBattleRankings";

const client = createAPIClient();


export function buildPromises(muId, battleId){
  const promises = [
  client.battle.getById({ battleId: battleId }),
  client.battle.getLiveBattleData({ battleId: battleId })
  ];

  if(muId)
    promises.push(
      client.mu.getById({ muId: muId }),
      getAllRankings([muId], { battleId: battleId, type: 'mu' })
    );
  return promises;
}

export async function getBattleParticipants(battle) {
  let requests = {};
  switch (battle.type){
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

  return await resolveRequests(requests);
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
