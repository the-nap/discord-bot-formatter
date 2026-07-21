import { readFile } from "node:fs/promises";

const USERS = new URL("./testData/users.json", import.meta.url);
const BATTLES = new URL("./testData/battles.json", import.meta.url);
const COMPANIES = new URL("./testData/companies.json", import.meta.url);
const REGIONS = new URL("./testData/regions.json", import.meta.url);
const MUS = new URL("./testData/mus.json", import.meta.url);
const ARTICLES = new URL("./testData/articles.json", import.meta.url);

export async function importer(dataType){
  const file = data[dataType];

  if(!file)
    throw new Error(`Unknown data type ${dataType}`);

  return JSON.parse(await readFile(file, 'utf8'));
}

const data = {
  'users': USERS,
  'battles': BATTLES,
  'regions': REGIONS,
  'companies': COMPANIES,
  'articles': ARTICLES,
  'mu': MUS
}
