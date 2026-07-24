import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const file = path.join(process.cwd(), "src", "state", "subscriptions.json");

export async function getSubscriptions(){
  return JSON.parse(await readFile(file, 'utf8'));
}

export async function saveSubscriptions(subscriptions){
  await writeFile(file, JSON.stringify(subscriptions, null, 2));
}
