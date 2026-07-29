import { EmbedBuilder } from "discord.js";
import { buildMembersBattleData, buildMuBattleData, buildRoundCount, buildScore, buildTitle } from "./builders.js";

export function buildBattleEmbed(context){
  const { file } = context;

  const embed = new EmbedBuilder()
  .setTitle(buildTitle(context))
  .addFields(
    buildScore(context),
    buildRoundCount(context),
    ...buildMuBattleData(context),
    ...buildMembersBattleData(context) 
  )

  if(file){
    embed.setImage("attachment://region.png");
    return {embed, file};
  }

  return {embed};
}
