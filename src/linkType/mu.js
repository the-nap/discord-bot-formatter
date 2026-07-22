import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder } from "discord.js";
import formatNumber from "#utils/formatNumber.js";
import { isInWar } from "#utils/skillset.js";

export default async function getMuData({ id }){
  const client = createAPIClient();

  const mu = await client.mu.getById({ muId: id })

  let muMembers = await Promise.all(
    mu.members.map((member) => {
    return client.user.getUserLite({ userId: member })
    })
  );

  muMembers = muMembers.filter( user =>
    user.isActive && user.rankings.weeklyUserDamages
  );

  const inWar = 
    muMembers.filter( user => isInWar(user.skills) ).length;

  const membersDamage = 
    [...muMembers].sort((a,b) => {

      return b.rankings.weeklyUserDamages.value - a.rankings.weeklyUserDamages.value;
    })
    .map((user) => {
      return `${user.username} - ${formatNumber(user.rankings.weeklyUserDamages.value)}`
    })
    .join('\n');

  const fields = [
    {
      name: '',
      value: `
        Danni Settimanali: ${ formatNumber(mu.rankings.muWeeklyDamages.value) }
        Players in war: ${ inWar } / ${ muMembers.length }
        Danno medio per war player: ${ formatNumber(mu.rankings.muWeeklyDamages.value / inWar) }
      `
    },
    { 
      name: 'Classifica',
      value: `${membersDamage}`
    }
  ]

  const embed = new EmbedBuilder()
  .setTitle(mu.name)
  .setThumbnail(mu.avatarUrl)
  .addFields(fields)

  return {embed};

}
