import { SlashCommandBuilder } from 'discord.js';
import getArticleData from '../../linkType/article.js';
import getUserData from '../../linkType/user.js';
import getBattleData from '../../linkType/battle.js';

export default {
  data: new SlashCommandBuilder()
    .setName('format')
    .setDescription('Formats warera links')
    .addStringOption((option) => option.setName('link').setDescription('The link to format').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();
    try{
      const link = interaction.options.getString('link',true);
      const result = await formatLink(link);
      if(!result[1])
        interaction.editReply(result[0]);
      else {
        interaction.editReply({
          content: result[0],
          embeds: [result[1]]
        });
      }
    } catch (err) {
      console.error(err)
      await interaction.editReply("Something went wrong while formatting this link.");
    }
  }
};


async function formatLink(link){

  const url = new URL(link);
  const parts = url.pathname.split('/').filter(Boolean);
  const id = parts[1];
  switch (parts[0]){
    case 'article':
      return getArticleData(link,id);
    case 'user':
      return getUserData(link,id);
    case 'battle':
      return getBattleData(link,id);
    //case 'company':
//      return getCompanyData(link,id);
    default:
      return ['Feature not implemented yet',null]
      
  }
}
