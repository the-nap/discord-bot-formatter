import { calculateTodayDamage, getVariation, getRankVariation } from "./calculations.js";

export function initializeMu(data, mu, members){

  data[mu._id] = {};
  data[mu._id].weeklyDamage = mu.rankings?.muWeeklyDamages?.value ?? 0,
  data[mu._id].yesterdayDamage = 0;
  data[mu._id].yesterdayRank = mu.rankings?.muWeeklyDamages?.rank;

  members.forEach( member => {
    data[mu._id][member._id] = {};
    data[mu._id][member._id].weeklyDamage = member.rankings?.weeklyUserDamages?.value ?? 0;
    data[mu._id][member._id].yesterdayDamage = 0;
  });
}

export function initializeMember(member, muData){

  muData[member._id] = {};
  muData[member._id].weeklyDamage = member.rankings?.weeklyUserDamages?.value ?? 0;
  muData[member._id].yesterdayDamage = 0;

}

export function processMu(muData, mu, update){

  const weekly = mu.rankings?.muWeeklyDamages?.value ?? 0;
  const today = calculateTodayDamage(weekly, muData.weeklyDamage);
  const variation = getVariation(muData.yesterdayDamage, today);

  const rank = mu.rankings?.muWeeklyDamages?.rank;
  const rankVariation = getRankVariation(muData.yesterdayRank, rank);

  if(update){
    updateData(muData, weekly, today, rank);
  }

  return {
    name: mu.name,
    today: today,
    variation: variation,
    rank: rank,
    rankVariation: rankVariation
  }
}

export function processMember(member, muData, update){
  const id = member._id;

  if(!muData[id]){
    if(update){
      initializeMember(member, muData);
    }
  }

  const weekly = member.rankings?.weeklyUserDamages?.value ?? 0;
  const today = calculateTodayDamage(weekly, muData[id]?.weeklyDamage);
  const variation = getVariation(muData[id]?.yesterdayDamage, today)

  if(update){
    updateData(muData[id], weekly, today);
  }

  return {
    name: member.username,
    today: today,
    variation: variation
  }
}

export function removeOldMembers(muData, members){
  const currentMembers = new Set(members.map(member => member._id));
  const reserved = new Set(['weeklyDamage', 'yesterdayDamage', 'yesterdayRank']);

  Object.keys(muData)
    .filter(userId => !reserved.has(userId) && !currentMembers.has(userId))
    .forEach(user => delete muData[user]);
}

function updateData(data, weekly, daily, rank){
    data.weeklyDamage = weekly;
    data.yesterdayDamage = daily;
    data.yesterdayRank = rank;
}

export const sorter = ((a,b) => {
  if(a === b) return 0;
  if(!a.today) return 1;
  if(!b.today) return -1;
  return b.today - a.today;
})

