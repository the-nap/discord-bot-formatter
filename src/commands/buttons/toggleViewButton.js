import { mobileFormatter } from "#utils/formatter.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, EmbedBuilder } from "discord.js";

const viewData = new Map();

export default {

  name: 'toggleView',

  async execute(interaction){

    const data = viewData.get(interaction.message.id);

    if(!data)
      return;
    await interaction.deferReply({
      flags: MessageFlags.Ephemeral
    });

    const fields = mobileFormatter(data.data, data.columns);

    const embed = EmbedBuilder.from(interaction.message.embeds[0]);
    const oldFields = embed.data.fields.slice(0, embed.data.fields.length - 4)
    
    embed.setFields(...oldFields, ...fields);

    await interaction.editReply({
      embeds: [embed],
    })
  },
}

function toggleViewButton(view = 'desktop'){ 
  return new ButtonBuilder()
    .setCustomId(`toggleView`)
    .setLabel(
      view === 'desktop'
        ? 'Mostra per mobile'
        : 'Mostra per desktop'
    )
    .setStyle(ButtonStyle.Primary);
}

export function withToggleViewButton( messageId, result){
  viewData.set(messageId, result.formattable);
  return {
    embeds: [result.embed],
    files: result.file ? [result.file] : [],
    components: [ 
      new ActionRowBuilder()
        .addComponents(toggleViewButton())
    ]
  }
}
