import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder } from "discord.js";
import formatNumber from "#utils/formatNumber.js";
import { isInWar } from "#utils/skillset.js";
import { sorter, valueFormatter } from "#utils/formatter.js";
import { createUserObject } from "./user/util.js";

export default async function getMuData({ id }){
  const client = createAPIClient();

  const mu = await client.mu.getById({ muId: id })

  let muMembers = await Promise.all(
    mu.members.map((member) => {
    return client.user.getUserLite({ userId: member })
    })
  );

  muMembers = muMembers.filter( user => user.isActive );

  const inWar = 
    muMembers.filter( user => isInWar(user.skills) ).length;

  const users =  muMembers
    .map( user => createUserObject(user) )
    .sort(sorter('damage'));


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
      name: '👤 Player',
      value: valueFormatter(users, user => user.name),
      inline: true
    },
    {
      name: '💥 Danni',
      value: valueFormatter(users, user => formatNumber(user.damage)),
      inline: true
    },
    {
      name: '🧬 Skillset',
      value: valueFormatter(users, user => user.skills),
      inline: true
    }
  ]

  const embed = new EmbedBuilder()
  .setTitle(mu.name)
  .setThumbnail(mu.avatarUrl)
  .addFields(fields)

  return {embed};

}
