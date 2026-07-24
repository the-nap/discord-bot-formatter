import { calculateTodayDamage, formatDamage, getVariation } from "./calculations.js";

export async function initializeMu(data, mu, members){

  data[mu._id] = {};
  data[mu._id].weeklyDamage = mu.rankings?.muWeeklyDamages?.value ?? 0,
  data[mu._id].yesterdayDamage = 0;

  members.forEach( member => {
    data[mu._id][member._id] = {};
    data[mu._id][member._id].weeklyDamage = member.rankings?.weeklyUserDamages?.value ?? 0;
    data[mu._id][member._id].yesterdayDamage = 0;
  });
}

export async function initializeMember(member, muData){

  muData[member._id] = {};
  muData[member._id].weeklyDamage = member.rankings?.weeklyUserDamages?.value ?? 0;
  muData[member._id].yesterdayDamage = 0;

}

export async function processMu(muData, mu){

  const weekly = mu.rankings?.muWeeklyDamages?.value ?? 0;
  const today = calculateTodayDamage(weekly, muData.weeklyDamage);
  const variation = getVariation(muData.yesterdayDamage, today);

  return `${formatDamage(today, variation)}`
}

export async function processMember(member, muData, update){
  const id = member._id;

  if(!muData[id]){
    if(update)
      initializeMember(member, muData);
  }

  const weekly = member.rankings?.weeklyUserDamages?.value ?? 0;
  const today = calculateTodayDamage(weekly, muData[id].weeklyDamage);
  const variation = getVariation(muData[id].yesterdayDamage, today)

  return {
    name: member.username,
    value: {
      today: today,
      variation: variation
    }
  }
}

export function removeOldMembers(muData, members){
  const currentMembers = new Set(members.map(member => member._id));
  const reserved = new Set(['weeklyDamage', 'yesterdayDamage']);

  Object.keys(muData)
    .filter(userId => !reserved.has(userId) && !currentMembers.has(userId))
    .forEach(user => delete muData[user]);
}

export const sorter = ((a,b) => {
  if(a === b) return 0;
  if(!a.value) return 1;
  if(!b.value) return -1;
  return b.value.today - a.value.today;
})
