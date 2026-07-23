import subscriptions from '#state/subscriptions.json' with { type: 'json' };
import { createAPIClient } from '@wareraprojects/api';
import formatNumber from '#utils/formatNumber.js';
import { EmbedBuilder } from 'discord.js';
import { writeFile } from 'node:promises';

const client = createAPIClient();
const dataFile = new URL("#state/mus.json", import.meta.url);

//mus.json:
//{
  //muId: {
    //weeklyDamage: x,
    //yesterdayDamage: y,
    //userId1: {
      //weeklyDamage: x,
      //yesterdayDamage: y
      //},
    //userId2: {
      //weeklyDamage: x,
      //yesterdayDamage: y
      //}
    //}
export async function dailyReport(discordClient, toSave){

  const oldData = JSON.parse(await readFile(dataFile, 'utf8'));

  const currentMuData = await fetchMu();

  for( let subscription of subscriptions ){
    const channel = await discordClient.channels.fetch(subscription.channel);
    const muId = subscription.mu;
    const selectedMu = currentMuData.find(item => item._id === muId);

    const newWeekly = selectedMu.rankings.muWeeklyDamages.value;

    const members = await fetchUsers(selectedMu);

    if(!oldData[muId]){
      oldData[muId] = {
        weeklyDamage: selectedMu.rankings.muWeeklyDamages.value,
        yesterdayDamage: 0
      }
    }

    const todayDamage = newWeekly - oldData[muId].weeklyDamage;
    const muChange = getDifference(oldData[muId]?.yesterdayDamage, todayDamage)
    const muResult = format(todayDamage, muChange);

    const membersData = members.map(member => {
      const memberId = member._id;
      if(!oldData[muId][memberId]){
        oldData[muId][memberId] = {
          weeklyDamage: member.rankings.weeklyDamage,
          yesterdayDamage: 0
        }

        return {
          user: member.username,
          value: null
        }
      }
      const todayDamage = member.rankings.weeklyDamage - oldData[muId][memberId].weeklyDamage;
      const memberChange = getDifference(oldData[muId][memberId], todayDamage);

      if(toSave){
        oldData[muId][memberId].weeklyDamage = member.rankings.weeklyDamage
        oldData[muId][memberId].yesterdayDamage = todayDamage
      }

      return {
        user: member.username,
        value: {
          today: todayDamage,
          change: memberChange
        }
      }
    })

    await channel.send({
      embeds: [buildEmbed(selectedMu, muResult, membersData)]
    })

    if(toSave){
      oldData[muId].weeklyDamage = newWeekly;
      oldData[muId].yesterdayDamage = todayDamage;
    }
  }
  if(toSave)
    await writeFile(dataFile, JSON.stringify(oldData, null, 2));
}

function percentDifference(A, B) {
  return `${((A - B) / B) * 100}%`
}

function format(today, change){
  return `${formatNumber(today)} (${change})`
}

function getDifference(yesterdayDamage, todayDamage){
  return yesterdayDamage
    ? percentDifference(todayDamage, yesterdayDamage)
    : '(non valido)'
}

async function fetchMu(){
  return await Promise.all(
    subscriptions.map((subscription) => 
      client.mu.getById({ muId: subscription.mu })
    )
  )
}

async function fetchUsers(mu){
  return await Promise.all(
    mu.members.map((member) =>
      client.user.getUserLite({ userId: member })
    )
  );
}

function buildEmbed(mu, muResult, membersData){
    const sortedMembers = 
    [...membersData].sort((a,b) => {
      if(a === b) return 0;
      if(!a.value) return 1;
      if(!b.value) return -1;
      return b.value.today - a.value.today;
    });

  return new EmbedBuilder
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
            return `${member.user}: nessun dato  6`
          return `${member.user}: ${format(member.value.today, member.value.change)}`;
        }).join(`\n`)
      }
    )
}
