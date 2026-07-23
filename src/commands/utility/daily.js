import { SlashCommandBuilder } from "discord.js";
import { commandReport } from "../../scheduled/dailyReport.js";
import subscriptions from '#state/subscriptions.json' with { type:'json' };

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
    }
      const endTime = performance.now();
      console.log(`Total call took ${endTime - startTime} milliseconds`);
  }
}

async function getReport(interaction){

  const channel = interaction.channelId;
  const subscription = subscriptions.find(item => item.channel === channel)
  
  if(!subscription)
    throw new Error('Non sei iscritto a nessun canale')

  return await commandReport(subscription);
}
