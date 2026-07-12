import { SlashCommandBuilder } from 'discord.js';
import { createAPIClient } from '@wareraprojects/api';

export default {
  data: new SlashCommandBuilder()
    .setName('format')
    .setDescription('Formats warera links')
    .addStringOption((option) => option.setName('link').setDescription('The link to format').setRequired(true)),

  async execute(interaction) {
    const link = interaction.options.getString('link',true);
    await interaction.reply(formatLink(link));
  }
};


async function formatLink(link){
  const client = createAPIClient();
  const words = link.split(/\W+/);

  const articleId = ((words) => {
    for (let i = 0; i < words.length; i++){
    if(words[i] === 'article')
      return words[i++];
    }
  });

  const article = await client.article.getArticleLiteById(articleId);

  return article.title;
}
