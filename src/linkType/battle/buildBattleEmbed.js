import { EmbedBuilder } from "discord.js";
import { buildMembersBattleData, buildMuBattleData, buildRoundCount, buildScore, buildTitle } from "./builders.js";

export function buildBattleEmbed(context){

  const result = {};

  result['embed'] = new EmbedBuilder()
  .setTitle(buildTitle(context))
  .addFields(
    buildScore(context),
    buildRoundCount(context),
    ...buildMuBattleData(context),
  )

  const { file } = context;

  if(file){
    result['embed'].setImage("attachment://region.png");
    result['file'] = file;
  }
  if(context.rankings){
    result['formattable'] = buildMembersBattleData(context);
  }

  return result;

}
