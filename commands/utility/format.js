import { SlashCommandBuilder } from 'discord.js';
import { createAPIClient } from '@wareraprojects/api';

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
  const articleId = parts[parts.indexOf('article')+1];

  const article = await client.article.getArticleLiteById({ articleId: articleId });

  return article.title;
}
