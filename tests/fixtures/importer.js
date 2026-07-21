import { createAPIClient } from "@wareraprojects/api";
import { readFile, writeFile } from "node:fs/promises";

const USERS = new URL("./users.json", import.meta.url);
const BATTLES = new URL("./battles.json", import.meta.url);
const COMPANIES = new URL("./battles.json", import.meta.url);
const REGIONS = new URL("./battles.json", import.meta.url);
const ARTICLES = new URL("./battles.json", import.meta.url);

export async function importer(dataType){

  const client = createAPIClient();

  switch(dataType){
    case 'user':
      return importData({
        file: USERS,
        fetchData: async () => {
        const countries = await client.country.getAllCountries();
        const selectedCountries = countries
          .sort(() => Math.random() - 0.5)
          .slice(0, 20);

        const calls = selectedCountries.map(country =>
          client.user.getUsersByCountry({
            'countryId': country._id,
            'limit': 5
          })
        );
          return Promise.all(calls);
        },
        extractIds: pages =>
          pages.flatMap(page =>
            page.items.map(item => item_id)
          )
      });

    case 'battles':
      return getBattles();

  }
}

async function importData({
  file,
  fetchData,
  extractIds
}){
  let data = [];

  try {
    data = JSON.parse(await readFile(file, 'utf8'));
  } catch {}

  if(data.length > 0)
    return data;

  const result = await fetchData();

  const ids = extractIds(result);

  await writeFile(file, JSON.stringify(ids), 'utf8');
  return ids;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function getUsers(){
  let users = [];
  try{ 
    users = JSON.parse(
      await readFile(USERS, 'utf8')
    );
  } catch {}

    if(users.length > 0)
      return users;

  const client = createAPIClient();


  users = (await Promise.all(calls)).flat();
  const ids = users.flatMap(page => 
    page.items.map( item => 
      item._id
    )
  );
  await writeFile(USERS, JSON.stringify(ids), "utf8");
  return ids;
}

async function getBattles(){
  let battles = [];
  try {
    battles = JSON.parse(
      await readFile(BATTLES, 'utf8')
    );
  } catch {}
  if(battles.length > 0)
    return battles;

  const client = createAPIClient();

  battles = await client.battle.getBattles({ 'limit': 100 });

  const ids = battles.flatMap(page =>
    page.items.map(item => item._id)
  );

  await writeFile(BATTLES, JSON.stringify(ids), "utf8");
  return ids;
}
