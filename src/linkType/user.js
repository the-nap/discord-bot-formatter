import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { getEquipFormatted } from "#utils/equipMaker.js";
import { isInWar } from "#utils/skillset.js";

export default async function getUserData(link, id){
  const client = createAPIClient();
  
  const [user, equipment] = await Promise.all([
    client.user.getUserById({ userId: id }),
    client.inventory.fetchCurrentEquipment({ userId: id })
  ]);

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
    if(isInWar(user.skills))
      return '⚔️ War';
    return '💰 Eco';
  }

  const image = await getEquipFormatted(equipment);
  const file = new AttachmentBuilder(image, { name: "equip.png" });


  const embed = new EmbedBuilder()
  .setTitle(user.username)
  .setURL(link)
  .setThumbnail(user.avatarUrl)
  .addFields(
    { name: 'Barre', value:
      `${healthField()}\n
       ${hungerField()}\n
       ${energyField()}\n
       ${enterField()}\n
       ${skillSet()}` },
  )
  .setImage('attachment://equip.png');

  return ['', embed, file];
}

