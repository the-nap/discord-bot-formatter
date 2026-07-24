import { SlashCommandBuilder } from "discord.js";
import { commandReport } from "../../scheduled/dailyReport.js";
import { getSubscriptions } from "#utils/subscriptionsHandler.js";

export default {
  cooldown: 3,
  data: new SlashCommandBuilder()
  .setName('daily')
  .setDescription('Ottieni info giornaliere sul danno'),

  async execute(interaction) {
    const startTime = performance.now();
    await interaction.deferReply();
    try{

      const result = await getReport(interaction);

      interaction.editReply({
        embeds: [result]
      });

    }catch(err){
      console.log('Error\n');
      console.log(err);
      interaction.editReply({
        content: err.message
      })
    }
      const endTime = performance.now();
      console.log(`Total call took ${endTime - startTime} milliseconds`);
  }
}

async function getReport(interaction){

  const channel = interaction.channelId;
  const subscriptions = await getSubscriptions();
  const subscription = subscriptions.find(item => item.channel === channel)
  
  if(!subscription)
    throw new Error('Non sei iscritto a nessun canale')

  return await commandReport(subscription);
}
