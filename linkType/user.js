import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder } from "discord.js";

export default async function getUserData(link, id){
  const client = createAPIClient();

  const user = await client.user.getUserById({ userId: id });

  const healthField = () => {
    const current = user.skills.health.currentBarValue.toFixed(1);
    const total = user.skills.health.total;
    if ( current >= total )
      return "💚 Vita **PIENA!**";
    return `💚 Vita ${current} / ${total}`;
  }

  const hungerField = () => {
    const current = user.skills.hunger.currentBarValue.toFixed(1);
    const total = user.skills.hunger.total;
    if ( current >= total )
      return "🍗 Fame **PIENA!**";
    return `🍗 Fame ${current} / ${total}`;
  }

  const energyField = () => {
    const current = user.skills.energy.currentBarValue.toFixed(1);
    const total = user.skills.energy.total;
    if ( current >= total )
      return "⚡ Energia **PIENA!**";
    return `⚡ Energia ${current} / ${total}`;
  }

  const enterField = () => {
    const current = user.skills.entrepreneurship.currentBarValue.toFixed(1);
    const total = user.skills.entrepreneurship.total;
    if ( current >= total )
      return "💡 Lavoro aut. **PIENA!**";
    return `💡 Lavoro aut. ${current} / ${total}`;
  }

  const skillSet = () => {
    if(user.skills.attack.level > 3 && user.skills.precision.level > 3 && user.skills.energy.level < 2 && user. skills.production.level < 3)
      return '⚔️ War';
    return '💰 Eco';
  }

  const embed = new EmbedBuilder()
  .setTitle(user.username)
  .setURL(link)
  .setThumbnail(user.avatarUrl)
  .addFields(
    { name: 'Vita', value: `${healthField()}` },
    { name: 'Fame', value: `${hungerField()}` },
    { name: 'Energia', value: `${energyField()}` },
    { name: 'Lavoro', value: `${enterField()}` },
    { name: 'Skill', value: `${skillSet()}` }
  )

  return ['', embed];
}
