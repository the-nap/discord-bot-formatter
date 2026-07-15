import Canvas  from "@napi-rs/canvas";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [ WIDTH, HEIGHT ] = [256, 256];

const emptyPath = path.join(__dirname, '../assets/frame.png');

export async function getEquipFormatted(equipment) {
  const canvas = Canvas.createCanvas(WIDTH*7 + 70, HEIGHT+20);
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

    if(data[i].tier !== undefined){

      const g = context.createLinearGradient(x0, y0, x0+WIDTH, y0+HEIGHT);
      g.addColorStop(0, rarities[data[i].tier][0]);
      g.addColorStop(1, rarities[data[i].tier][1]);

      context.fillStyle = g;
      context.fillRect(x0, y0, x0+WIDTH, y0+HEIGHT)
    }
    context.drawImage(data[i].image, x0, y0, WIDTH, HEIGHT)
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
