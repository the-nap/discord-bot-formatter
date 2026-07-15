import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import  Canvas  from "@napi-rs/canvas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emptyPath = path.join(__dirname, '../assets/frame.png');

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
    if(user.skills.attack.level > 3 && user.skills.precision.level > 3 && user.skills.energy.level < 2 && user. skills.production.level < 3)
      return '⚔️ War';
    return '💰 Eco';
  }

  const image = await createImage(equipment);
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

async function createImage(equipment) {
  const [ COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, MYTHIC ] = [ 0, 1, 2, 3, 4 ,5];
  const canvas = Canvas.createCanvas(256*7 + 70, 256+20);
  const context = canvas.getContext('2d');
  context.fillStyle = '#101416';
  context.fillRect(0,0, canvas.width, canvas.height);

  const rarities = [
    ['#49565F', '#273136'], // Common
    ['#13301E', '#08150D'], // Uncommon
    ['#102249', '#070F1F'], // Rare
    ['#291A3F', '#120B1B'], // Epic
    ['#383514', '#181708'], // Legendary
    ['#411212', '#1C0808'], // Mythic
  ];

  const slots = [
    equipment.weapon?.code,
    equipment.ammo,
    equipment.helmet?.code,
    equipment.chest?.code,
    equipment.gloves?.code,
    equipment.pants?.code,
    equipment.boots?.code
  ];

  const parsedEquipment = slots.map((item) => parseEquipment(item));

  const data = await Promise.all(
    parsedEquipment.map(async parsed => ({
      tier: parsed?.tier,
      image: parsed
        ? await Canvas.loadImage(`https://app.warera.io/images/items/${parsed.name}.png`)
        : await Canvas.loadImage(emptyPath)
    }))
  );


  for( let i = 0; i < data.length; i++ ){

    const [x0, y0] = [10 + i*266, 10]
    const [x1, y1] = [x0+256, y0+256];

    if(data[i].tier !== undefined){
      console.log(data[i].tier);
      console.log(rarities[data[i].tier]);


      const g = context.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, rarities[data[i].tier][0]);
      g.addColorStop(1, rarities[data[i].tier][1]);

      context.fillStyle = g;
      context.fillRect(x0, y0, 256, 256)
    }
    context.drawImage(data[i].image, x0, y0, 256, 256)
  }

  return canvas.toBuffer('image/png');
}

function parseEquipment(item){
  if (!item) return null;
  switch(item) {
    case 'lightAmmo':
      return {
        name: item,
        tier: 1,
      }
    case 'ammo':
      return {
        name: item,
        tier: 2,
      }
    case 'heavyAmmo':
      return {
        name: item,
        tier: 3,
      }
    case 'knife':
      return {
        name: item,
        tier: 0,
      }
    case 'gun':
      return {
        name: item,
        tier: 1,
      }
    case 'rifle':
      return {
        name: item,
        tier: 2,
      }
    case 'sniper':
      return {
        name: item,
        tier: 3,
      }
    case 'tank':
      return {
        name: item,
        tier: 4,
      }
    case 'jet':
      return {
        name: item,
        tier: 5,
      }
    default:
      const match = item.match(/^([a-zA-Z]+)(\d+)?$/);
      return {
        name: match[1],
        tier: Number(match[2] - 1)
      }
  }
}
