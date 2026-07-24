import { SlashCommandBuilder } from "discord.js";
import { commandReport } from "../../scheduled/dailyReport.js";
import { getSubscriptions } from "#utils/subscriptionsHandler.js";

export default {
  cooldown: 3,
  data: new SlashCommandBuilder()
  .setName('daily')
  .setDescription('Ottieni info giornaliere sul danno'),

  async execute(interaction) {
    await interaction.deferReply();

    const result = await getReport(interaction);

    interaction.editReply({
      embeds: [result]
    });
  }
}

async function getReport(interaction){

  const channel = interaction.channelId;
  const subscriptions = await getSubscriptions();
  const subscription = subscriptions.find(item => item.channel === channel)
  
  if(!subscription)
    throw new Error('Non sei iscritto a nessuna mu. Usa /follow');

  return await commandReport(subscription);
}
