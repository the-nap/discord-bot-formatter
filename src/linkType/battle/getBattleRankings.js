import { createAPIClient } from "@wareraprojects/api";

const client = createAPIClient();

export async function getAllRankings(toSearch, rankingData){

  let max = Infinity;
  if(rankingData.maxDamage)
    max = rankingData.maxDamage;


  const toSearchIds = new Set(toSearch);
  let cursor;
  let damageCounter = 0;

  let matching = new Map();

  while(true) {
    const response = await client.battleRanking.getRanking({ 'battleId': rankingData.id, 'type': rankingData.type, 'side': 'merged', 'dataType': 'damage', 'cursor': cursor });
    for( let item of response.items ){
      if(damageCounter === max)
        return matching;
      if(item.value < 100_000)
        return matching;
      const id = item.mu ?? item.user;
      if(toSearchIds.has(id)){
        matching.set(id, item.value);
        damageCounter += item.value;
      }
    }

    if(matching.size === toSearchIds.size)
      return matching;

    if(!response.nextCursor) {
      return matching;
    }

    cursor = response.nextCursor;
  }
}
