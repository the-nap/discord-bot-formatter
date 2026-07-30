import { EmbedBuilder } from "discord.js";
import { buildMembersBattleData, buildMuBattleData, buildRoundCount, buildScore, buildTitle } from "./builders.js";
import { pcFormatter } from "#utils/formatter.js";

export function buildBattleEmbed(context){

  const result = {};

  result['embed'] = new EmbedBuilder()
  .setTitle(buildTitle(context))
  .addFields(
    buildScore(context),
    buildRoundCount(context),
    ...buildMuBattleData(context),
  )

  if(context.rankings){
    const lastField = buildMembersBattleData(context);
    result['formattable'] = lastField;
    result.embed.addFields(pcFormatter(lastField.data, lastField.columns));
  }

  const { file } = context;

  if(file){
    result['embed'].setImage("attachment://region.png");
    result['file'] = file;
  }

  return result;

}
