export default async function getArticleData(id){

  const article = await client.article.getArticleLiteById({ articleId: id });

}
