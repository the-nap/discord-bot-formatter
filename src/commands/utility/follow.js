import { SlashCommandBuilder } from "discord.js";
import { createAPIClient } from "@wareraprojects/api";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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

      const guild  = interaction.guildId;
      const name = interaction.options.getString('mu');
      const channel = interaction.channelId;
      const result = await subscribe(guild, channel, name);
      interaction.editReply(result);

    } catch (err) {
      console.log(err);
      await interaction.editReply(err.message);
    }
    const endTime = performance.now();
    console.log(`Total call took ${endTime - startTime} milliseconds`);
  }
}

async function subscribe(guild, channel, link){

  const data = await loadData();

  const id = getId(link);

  const newObject = {
    'guild': guild,
    'channel': channel,
    'mu': id
  };

  const exists = data.some(item =>
    item.guild === guild &&
    item.channel === channel &&
    item.mu === id
  );

  if(exists) {
    return 'Stai già seguendo questa mu';
  }

  const mu = await fetchMu(id);

  writeNewObject(newObject, data);
  return `Stai ora seguendo ${mu.name}`;
}

async function loadData(){

  let data;
  try{
    data = JSON.parse(await readFile(file, "utf8"));
  } catch(err) {
    console.log(err)
    throw new Error('Error while reading state');
  }

  if(!data)
    throw new Error('Error in the state file');
  return data;
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
  await writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

async function fetchMu(id){
  const mu = await client.mu.getById({ muId: id });
  
  if(!mu)
    throw new Error('Errore nella ricerca della mu');

  return mu;
}
