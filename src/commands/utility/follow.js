import { SlashCommandBuilder } from "discord.js";
import { createAPIClient } from "@wareraprojects/api";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSubscriptions, saveSubscriptions } from "#utils/subscriptionsHandler.js";

const client = createAPIClient();
const file = path.join(process.cwd(), "src", "state", "subscriptions.json");

export default {
  cooldown: 3,
  data: new SlashCommandBuilder()
  .setName('follow')
  .setDescription('Specifica la mu da seguire in un canale')
  .addStringOption((option) => option.setName('mu').setDescription('Il link alla mu da seguire').setRequired(true)),

  async execute(interaction) {
    const startTime = performance.now();
    await interaction.deferReply();
    try{

      const name = interaction.options.getString('mu');
      const channel = interaction.channelId;
      const result = await subscribe(channel, name);
      interaction.editReply(result);

    } catch (err) {
      console.log(err);
      await interaction.editReply(err.message);
    }
    const endTime = performance.now();
    console.log(`Total call took ${endTime - startTime} milliseconds`);
  }
}

async function subscribe(channel, link){

  const subscriptions = await getSubscriptions();

  console.log(subscriptions);

  const id = getId(link);

  const newObject = {
    'channel': channel,
    'mu': id
  };

  const exists = subscriptions.some(item =>
    item.channel === channel
  );

  if(exists) {
    return 'Stai già seguendo una mu';
  }

  const mu = await fetchMu(id);

  writeNewObject(newObject, subscriptions);
  return `Stai ora seguendo ${mu.name}`;
}

function getId(link){
  let url;
  try {
     url = new URL(link);
  }catch {
    throw new Error('Inserire un link di warera');
  }

  if(url.hostname !== 'app.warera.io')
    throw new Error('Inserito link non di warera')
  const parts = url.pathname.split('/').filter(Boolean);

  if(parts[0] !== 'mu')
    throw new Error('Il link inserito non è di una mu');

  if(!parts[1]){
    throw new Error('Inserito link errato');
  }

  return parts[1];
}

async function writeNewObject(newObject, data){
  data.push(newObject);
  await saveSubscriptions(data)
}

async function fetchMu(id){
  const mu = await client.mu.getById({ muId: id });
  
  if(!mu)
    throw new Error('Errore nella ricerca della mu');

  return mu;
}
