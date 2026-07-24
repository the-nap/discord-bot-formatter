import { SlashCommandBuilder } from 'discord.js';
import getArticleData from '#linkType/article.js';
import getCompanyData from '#linkType/company.js';
import getMuData from '#linkType/mu.js';
import getUserData from '#linkType/user.js';
import getBattleData from '#linkType/battle/battle.js';
import getRegionData from '#linkType/region.js';

export default {
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName('format')
    .setDescription('Formatta i link warera')
    .addStringOption((option) => option.setName('opzioni').setDescription('Link + messaggio aggiuntivo').setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();
    const result = await formatLink(interaction);

    await interaction.editReply({
      embeds: [result.embed],
      files: result.file ? [result.file] : []
    });

    if(result.update){
      const updatedEmbed = await result.update();
      await interaction.editReply({
        embeds: [updatedEmbed.embed],
      });
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

  const input = interaction.options.getString('opzioni', true);

  const [link, ...textParts] = input.split(" ");

  const text = textParts.join(" ");

  const context = { channel: interaction.channelId };

  const url = new URL(link);
  if(url.hostname !== 'app.warera.io')
    throw new Error('Sito errato')
  const parts = url.pathname.split('/').filter(Boolean);

  if(!parts[1]){
    throw new Error('Link malformato');
  }

  const id = parts[1];
  const handler = handlers[parts[0]];

  if(!handler)
    throw new Error('Metodo ancora non supportato');

  const result = await handler({id, context});

  result.embed.setURL(link);

  if(text)
    result.embed.setDescription(`**${text}**`);

  return result;
}
