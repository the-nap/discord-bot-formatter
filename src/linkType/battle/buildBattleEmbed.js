import formatNumber from "#utils/formatNumber.js";
import { EmbedBuilder } from "discord.js";

export function buildBattleEmbed({
  battle,
  battleDetails,
  membersDamage,
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

  if(muDamage)
    fields.push({ name:`----Danni----`, value: `${muDamage.name} ${muDamage.damage}` })

  const membersDamageData = [...membersDamage.entries()]
    .sort((a,b) => {
      return b[1] - a[1]
    })
    .map((user) => {
      return `${user[0]} - ${formatNumber(user[1])}`
    })
    .join('\n');

  fields.push({ name:'', value: membersDamageData })

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
