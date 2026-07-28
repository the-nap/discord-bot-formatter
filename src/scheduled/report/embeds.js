import { EmbedBuilder } from "discord.js";
import formatNumber from "#utils/formatNumber.js";
import { valueFormatter } from "#utils/formatter.js";

export function buildEmbed(mu, muReport, membersReport){

  return new EmbedBuilder()
    .setTitle(muReport.name)
    .setURL(`https://app.warera.io/mu/${mu._id}`)
    .setThumbnail(mu.avatarUrl)
    .addFields(
      { 
        name: '💥 Danni',
        value: valueFormatter([muReport], m => formatNumber(m.today)),
        inline: true
      },
      {
        name: '📊 Variazione',
        value: valueFormatter([muReport], m => m.variation),
        inline: true
      },
      {
        name: '🏆 Rank',
        value: `${muReport.rank}  (${muReport.rankVariation})`,
        inline: true
      },

      { name: '\u200b', value: '\u200b', inline: false},

      {
        name: '👤 Player',
        value: valueFormatter(membersReport, m => m.name),
        inline: true
      },
      {
        name: '💥 Danni',
        value: valueFormatter(membersReport, m => formatNumber(m.today)),
        inline: true
      },
      {
        name: '📊 Variazione',
        value: valueFormatter(membersReport, m => m.variation),
        inline: true
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
