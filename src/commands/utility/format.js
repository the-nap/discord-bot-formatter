import { SlashCommandBuilder } from 'discord.js';
import getArticleData from '#linkType/article.js';
import getCompanyData from '#linkType/company.js';
import getMuData from '#linkType/mu.js';
import getUserData from '#linkType/user.js';
import getBattleData from '#linkType/battle.js';
import getRegionData from '#linkType/region.js';

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
      console.log('Thrown error');
      console.log(err);
      await interaction.editReply("Link non supportato");
    }
    const endTime = performance.now();
    console.log(`Total call took ${endTime - startTime} milliseconds`);
  }
};

const handlers = {
  'article': getArticleData,
  'user': getUserData,
  'battle': getBattleData,
  'region': getRegionData,
  'company': getCompanyData,
  'mu': getMuData,
}

async function formatLink(link){

  console.log(link);

  const url = new URL(link);
  if(url.hostname !== 'app.warera.io')
    throw new Error('Unsupported website')
  const parts = url.pathname.split('/').filter(Boolean);

  if(!parts[1]){
    throw new Error('Unsupported Link');
  }

  const id = parts[1];
  const handler = handlers[parts[0]];
  console.log(handler);

  if(!handler)
    return ['Ottima idea, ma ancora non si può fare'];

  return handler(link, id)
}
