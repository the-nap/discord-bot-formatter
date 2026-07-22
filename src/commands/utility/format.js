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
      const result = await formatLink(interaction);
      if(result.file){
        interaction.editReply({
          embeds: [result.embed],
          files: [result.file]
        })
        return;
      }
      interaction.editReply({
        embeds: [result.embed]
      })
    } catch (err) {
      console.log('Thrown error');
      console.log(err);
      await interaction.editReply("Link non supportato");
    } finally {
      const endTime = performance.now();
      console.log(`Total time: ${endTime - startTime} milliseconds\n\n`);
    }
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

async function formatLink(interaction){

  const link = interaction.options.getString('link', true);
  const options = interaction.options.getString('opzioni')
  const context = { channel: interaction.channelId, guild: interaction.guildId };

  const url = new URL(link);
  if(url.hostname !== 'app.warera.io')
    throw new Error('Unsupported website')
  const parts = url.pathname.split('/').filter(Boolean);

  if(!parts[1]){
    throw new Error('Unsupported Link');
  }

  const id = parts[1];
  const handler = handlers[parts[0]];

  if(!handler)
    throw new Error('Metodo ancora non supportato');

  const {embed, file} = await handler({id, context});

  if(options)
    embed.setDescription(`**${options}**`);

  embed.setURL(link);
  return { embed: embed, file: file };


}
