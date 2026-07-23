import subscriptions from '#state/subscriptions.json' with { type: 'json' };
import { createAPIClient } from '@wareraprojects/api';
import formatNumber from '#utils/formatNumber.js';
import { EmbedBuilder } from 'discord.js';
import { readFile, writeFile } from 'node:fs/promises';


const client = createAPIClient();
const dataFile = new URL("../state/mus.json", import.meta.url);

export async function autoReport(discordClient){

  for( let subscription of subscriptions ){
    const channel = discordClient.channels.cache.get(subscription.channel)
    await channel.send({
      embeds: [ await generateReport(subscription.mu, true)]
    })
  }
}

export async function commandReport(subscription){
  const muId = subscription.mu;
  return await generateReport(muId)
}

async function generateReport(muId, updateData = false){

  const oldData = JSON.parse(await readFile(dataFile, 'utf8'));

  const selectedMu = await client.mu.getById({ muId: muId });

  const newWeekly = selectedMu.rankings?.muWeeklyDamages?.value ?? 0;
  const members = await fetchUsers(selectedMu);
  if(!oldData[muId]){
    if(updateData)
      await addMu(oldData, selectedMu);
    return buildFailingEmbed(selectedMu._id, selectedMu.name, selectedMu.avatarUrl);
  }
  const todayDamage = calculateTodayDamage(newWeekly, oldData[muId].weeklyDamage);
  const muChange = getVariation(oldData[muId]?.yesterdayDamage, todayDamage)
  const muResult = format(todayDamage, muChange);

  const membersData = members.map(member => {
    const memberId = member._id;
    if(!oldData[muId][memberId]){
      if(updateData)
        oldData[muId][memberId] = {
          weeklyDamage: member.rankings?.weeklyUserDamages?.value ?? 0,
          yesterdayDamage: 0
        }
      return {
        user: member.username,
        value: null
      }
    }
    const newWeekly = member.rankings?.weeklyUserDamages?.value ?? 0;
    const todayDamage = calculateTodayDamage(newWeekly, oldData[muId][memberId].weeklyDamage);
    const memberChange = getVariation(oldData[muId][memberId].yesterdayDamage, todayDamage);

    if(updateData){
      oldData[muId][memberId].weeklyDamage = newWeekly;
      oldData[muId][memberId].yesterdayDamage = todayDamage;
    }

    return {
      user: member.username,
      value: {
        today: todayDamage,
        change: memberChange
      }
    }
  })

  if(updateData){
    oldData[muId].weeklyDamage = newWeekly;
    oldData[muId].yesterdayDamage = todayDamage;
    await writeFile(dataFile, JSON.stringify(oldData, null, 2));
  }

  return buildEmbed(selectedMu, muResult, membersData);
}

async function addMu(oldData, mu){
  oldData[mu._id] = {};
  oldData[mu._id].weeklyDamage = mu.rankings?.muWeeklyDamages?.value ?? 0,
  oldData[mu._id].yesterdayDamage = 0;
  const members = await fetchUsers(mu);
  members.forEach( member => {
    oldData[mu._id][member._id] = {};
    oldData[mu._id][member._id].weeklyDamage = member.rankings?.weeklyUserDamages?.value ?? 0;
    oldData[mu._id][member._id].yesterdayDamage = 0;
  });
  console.log(oldData);
  await writeFile(dataFile, JSON.stringify(oldData, null, 2));
}

function calculateTodayDamage(newValue, old){
  return (newValue >= old)
    ? newValue - old
    : newValue
}

function getVariation(A, B) {
  if(A <= 0)
    return '';
  let result = (((B - A) / A) * 100).toFixed(2);
  if(result > 0)
    return `(+${result})`;
  return `(${result})`;
}

function format(today, change){
  return `${formatNumber(today)} ${change}`
}

async function fetchUsers(mu){
  const users = await Promise.all(
    mu.members.map((member) =>
      client.user.getUserLite({ userId: member })
    )
  )
  return users.filter(user => user.isActive)
}

function buildEmbed(mu, muResult, membersData){
    const sortedMembers = 
    [...membersData].sort((a,b) => {
      if(a === b) return 0;
      if(!a.value) return 1;
      if(!b.value) return -1;
      return b.value.today - a.value.today;
    });

  return new EmbedBuilder()
    .setTitle(mu.name)
    .setURL(`https://app.warera.io/mu/${mu._id}`)
    .setThumbnail(mu.avatarUrl)
    .addFields(
      { 
        name: 'Danni Totali',
        value: muResult
      },
      {
        name: 'Classifica Giornaliera',
        value: sortedMembers.map( member => {
          if(!member.value)
            return `${member.user}: Nessun dato`
          return `${member.user}: ${format(member.value.today, member.value.change)}`;
        }).join(`\n`)
      }
    )
}

function buildFailingEmbed(id, name, avatar){
  return new EmbedBuilder()
    .setTitle(name)
    .setDescription('Il canale è iscritto, ma è necessario un giorno per raccogliere i dati')
    .setURL(`https://app.warera.io/mu/${id}`)
    .setThumbnail(avatar);
}
