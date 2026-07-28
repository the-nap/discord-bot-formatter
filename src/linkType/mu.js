import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder } from "discord.js";
import formatNumber from "#utils/formatNumber.js";
import { sorter, valueFormatter } from "#utils/formatter.js";
import { createUserObject } from "#utils/formatter.js";

export default async function getMuData({ id }){
  const client = createAPIClient();

  const mu = await client.mu.getById({ muId: id })

  let muMembers = await Promise.all(
    mu.members.map((member) => {
    return client.user.getUserLite({ userId: member })
    })
  );

  muMembers = muMembers.filter( user => user.isActive );

  const users =  muMembers
    .map( user => createUserObject(user) )
    .sort(sorter('damage'));

  const inWar = users.filter( user => user.skills.endsWith("War"));
  const inEco = users.filter( user => user.skills.endsWith("Eco"));
  const hybrid = users.filter( user => user.skills.endsWith("Ibrido"));

  const fields = [
    {
      name: '',
      value: [
        `Danni Settimanali: ${ formatNumber(mu.rankings.muWeeklyDamages.value) }`,
        `Players war / eco / ibridi: ${ inWar.length } / ${ inEco.length } / ${ hybrid.length }`
      ].join("\n")
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
