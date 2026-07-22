import { createAPIClient } from "@wareraprojects/api";
import { EmbedBuilder } from "discord.js";

export default async function getArticleData({ id }){
  const client = createAPIClient();

  const article = await client.article.getArticleById({ articleId: id });
  const author = await client.user.getUserById({ userId: article.author });

  const embed = new EmbedBuilder()
  .setTitle(article.title)
  .setThumbnail(author.avatarUrl)
  .setAuthor({ name:`${author.username}`});

  return {embed};
}
