import { EmbedBuilder } from "discord.js";
import { formatNumber, pcFormatter } from "#utils/formatter.js";

export function buildEmbed(mu, muReport, membersReport){

  const embed = new EmbedBuilder()
    .setTitle(muReport.name)
    .setURL(`https://app.warera.io/mu/${mu._id}`)
    .setThumbnail(mu.avatarUrl)
    .addFields(pcFormatter([muReport], [
      { 
        name: '💥 Danni',
        getter: m => formatNumber(m.today),
      },
      {
        name: '📊 Variazione',
        getter: m => m.variation
      },
      {
        name: '🏆 Rank',
        getter: m => `${m.rank}  (${m.rankVariation})`,
      }
    ]),
      { name: '\u200b', value: '\u200b', inline: false})

  const columns = [
    {
      name: '👤 Player',
      getter: m => m.name
    },
    {
      name: '💥 Danni',
      getter: m => formatNumber(m.today),
    },
    {
      name: '📊 Variazione',
      getter: m => m.variation,
    }
  ]

  embed.addFields(pcFormatter(membersReport, columns));

  const formattable = { data: membersReport, columns: columns }
  return { embed: embed, formattable: formattable };
}

export function buildMissingEmbed(mu){
  return new EmbedBuilder()
    .setTitle(mu.name)
    .setDescription('Il canale è iscritto, ma è necessario un giorno per raccogliere i dati')
    .setURL(`https://app.warera.io/mu/${mu._id}`)
    .setThumbnail(mu.avatar);
}
