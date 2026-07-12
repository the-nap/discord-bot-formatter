import { SlashCommandBuilder } from 'discord.js';
import { createAPIClient } from '@wareraprojects/api';
import getArticleData from '../../linkType/article';
import getUserData from '../../linkType/user';

export default {
  data: new SlashCommandBuilder()
    .setName('format')
    .setDescription('Formats warera links')
    .addStringOption((option) => option.setName('link').setDescription('The link to format').setRequired(true)),

  async execute(interaction) {
    const link = interaction.options.getString('link',true);
    const result = await formatLink(link);
    interaction.reply(result);
  }
};


async function formatLink(link){
  const client = createAPIClient();

  const url = new URL(link);
  const parts = url.pathname.split('/').filter(Boolean);
  const data = parts[1];
  switch (parts[0]){
    case 'article':
      return getArticleData(data);
    case 'user':
      return getUserData(data);
    case 'battle'
      return getBattleData(data);
      

}
