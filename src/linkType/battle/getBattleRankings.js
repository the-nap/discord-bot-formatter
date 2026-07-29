import { createAPIClient } from "@wareraprojects/api";
import { fetchName } from "./api.js";

const client = createAPIClient();

export async function getAllRankings(toSearch, rankingData){

  let max = Infinity;
  if(rankingData.maxDamage)
    max = rankingData.maxDamage;

  const toSearchIds = new Set(toSearch);
  let cursor;
  let damageCounter = 0;

  let matching = {};

  while(true) {
    const response = await client.battleRanking.getRanking({ 'battleId': rankingData.battleId, 'type': rankingData.type, 'side': 'merged', 'dataType': 'damage', 'cursor': cursor });
    for( let item of response.items ){
      if(damageCounter === max)
        return matching;
      if(item.value < 100_000)
        return matching;
      const id = item.mu ?? item.user;
      if(toSearchIds.has(id)){
        matching[id] = {};
        matching[id].name = await fetchName(id, rankingData.type);
        matching[id].damage = item.value;
        matching[id].rank = item.rank;
        damageCounter += item.value;
      }
    }
    if(Object.keys(matching).length === toSearchIds.size)
      return matching;

    if(!response.nextCursor) {
      return matching;
    }

    cursor = response.nextCursor;
  }
}
