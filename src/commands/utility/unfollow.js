import { SlashCommandBuilder } from "discord.js";
import { createAPIClient } from "@wareraprojects/api";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const file = path.join(process.cwd(), "src", "state", "subscriptions.json");

export default {
  cooldown: 3,
  data: new SlashCommandBuilder()
  .setName('unfollow')
  .setDescription('Se in un canale si segue una mu, si smette di farlo'),

  async execute(interaction) {
    const startTime = performance.now();
    await interaction.deferReply();
    try{

      const channel = interaction.channelId;
      const result = await unsubscribe(channel);
      interaction.editReply(result);

    } catch (err) {
      console.log(err);
      await interaction.editReply('Qualcosa è andato storto, ma il comando è andato a buon fine' );
    }
    const endTime = performance.now();
    console.log(`Total call took ${endTime - startTime} milliseconds`);
  }
}

async function unsubscribe(channel){

  const data = await loadData();

  const index = data.findIndex(item =>
    item.channel === channel
  )

  const newArray = data.filter(item => !(
    item.channel === channel
  ))

  if(index > -1){
    await writeFile(file, JSON.stringify(newArray, null, 2), 'utf8');
    return `Hai smesso di seguire ${await fetchMu(data[index].mu)}`
  }

  return `Non stavi seguendo nessuna mu`;
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

async function fetchMu(id){
  const client = createAPIClient();
  const mu = await client.mu.getById({ muId: id });
  
  if(!mu)
    throw new Error('Errore nella ricerca della mu');

  return mu.name;
}
