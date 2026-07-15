import { SlashCommandBuilder } from 'discord.js';
import getArticleData from '../../linkType/article.js';
import getCompanyData from '../../linkType/company.js';
import getUserData from '../../linkType/user.js';
import getBattleData from '../../linkType/battle.js';
import getRegionData from '../../linkType/region.js';

export default {
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName('format')
    .setDescription('Formats warera links')
    .addStringOption((option) => option.setName('link').setDescription('The link to format').setRequired(true))
    .addStringOption((option) => option.setName('opzioni').setDescription('Messaggio aggiuntivo').setRequired(false)),

  async execute(interaction) {
    const startTime = performance.now();
    await interaction.deferReply();
    try{
      const link = interaction.options.getString('link',true);
      const opzioni = interaction.options.getString('opzioni');
      const result = await formatLink(link);
      if( result[1] && opzioni)
        result[1].setDescription('**'+opzioni+'**')
      switch(result.length){
        case(1):
          await interaction.editReply(result[0]);
          break;
        case(2):
          await interaction.editReply({
            content: result[0],
            embeds: [result[1]]
          });
          break;
        default:
          await interaction.editReply({
            content: result[0],
            embeds: [result[1]],
            files: [result[2]]
          });
      }

    } catch (err) {
      console.error(err)
      await interaction.editReply("Something went wrong while formatting this link.");
    }
    const endTime = performance.now();
    console.log(`Total call took ${endTime - startTime} milliseconds`);
  }
};


async function formatLink(link){

  const url = new URL(link);
  const parts = url.pathname.split('/').filter(Boolean);
  const id = parts[1];
  switch (parts[0]){
    case 'article':
      return getArticleData(link, id);
    case 'user':
      return getUserData(link, id);
    case 'region':
      return getRegionData(link, id)
    case 'battle':
      return getBattleData(link, id);
    case 'company':
      return getCompanyData(link, id);
    default:
      return ['Feature not implemented yet',null]
      
  }
}
