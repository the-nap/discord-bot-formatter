import { EmbedBuilder } from "discord.js";
import { formatDamage } from "./calculations.js";

export function buildEmbed(mu, muReport, membersReport){

  return new EmbedBuilder()
    .setTitle(mu.name)
    .setURL(`https://app.warera.io/mu/${mu._id}`)
    .setThumbnail(mu.avatarUrl)
    .addFields(
      { 
        name: 'Danni Totali',
        value: muReport
      },
      {
        name: 'Classifica Giornaliera',
        value: usersToString(membersReport, formatDamage)
      }
    )
}

export function buildMissingEmbed(mu){
  return new EmbedBuilder()
    .setTitle(mu.name)
    .setDescription('Il canale è iscritto, ma è necessario un giorno per raccogliere i dati')
    .setURL(`https://app.warera.io/mu/${mu._id}`)
    .setThumbnail(mu.avatar);
}

function usersToString(users, formatter){
  return users.map(member => {
    if(!member.value)
      return `${member.name}: Nessun dato`;
    return `${member.name}: ${formatter(member.value.today, member.value.variation)}`;
  }).join(`\n`);
}
