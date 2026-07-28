import formatNumber from "#utils/formatNumber.js";
import { sorter, valueFormatter } from "#utils/formatter.js";
import { EmbedBuilder } from "discord.js";

export function buildBattleEmbed({
  battle,
  battleDetails,
  rankings,
  muDamage,
  file,
  data,
}){

  const left = battle.type === "tournament"
    ? `Team ${data.defender.number}`
    : data.defender.name;

  const right = battle.type === "tournament"
    ? `Team ${data.attacker.number}`
    : data.attacker.name;

  const icon = battle.type === "resistance" ? "✊" : "⚔️";
  
  const points =
    `${left} 🛡️  ${battle.defender.wonRoundsCount} - ${battle.attacker.wonRoundsCount}  ${icon} ${right}`;

  const title = battle.type === "tournament"
    ? `Turno ${battle.tournamentRoundNumber}`
    : data.region.name;

  const round = !battle.isActive
    ? "La battaglia è terminata"
    : `Round ${battleDetails.battle.roundIds.length} in corso`;

  const fields = [
    { name: '', value: points },
    { name: '', value: round },
  ]

  const muData = Object.values(muDamage)[0];

  if(muDamage)
    fields.push({ 
      name: ``,
      value: `${muData.name}`,
      inline: true
    },
    {
      name: `Danni`,
      value: `${formatNumber(muData.damage)}`,
      inline: true
    },
    {
      name: 'Rank',
      value: `${muData.rank}`,
      inline: true
    },
    { name: '\u200b', value: '\u200b', inline: false},
    )

  if(rankings){
    const sortedMembers = Object.values(rankings).sort(sorter('damage'));
    fields.push({
      name: 'Player',
      value: valueFormatter(sortedMembers, m => m.name),
      inline: true
    },
    {
      name: 'Danni',
      value: valueFormatter(sortedMembers, m => formatNumber(m.damage)),
      inline: true
    },
    {
      name: 'Rank',
      value: valueFormatter(sortedMembers, m => m.rank),
      inline: true
    })
  }

  const embed = new EmbedBuilder()
  .setTitle(title)
  .addFields(
    fields
  )

  if(file){
    embed.setImage("attachment://region.png");
    return {embed, file};
  }

  return {embed};
}
