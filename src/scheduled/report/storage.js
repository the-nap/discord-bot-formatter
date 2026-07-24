import { readFile, writeFile } from "node:fs/promises";

const dataFile = new URL("../../state/mus.json", import.meta.url);

export async function loadData() {
  return JSON.parse(await readFile(dataFile, "utf8"));
}

export async function saveData(data) {
  await writeFile(dataFile, JSON.stringify(data, null, 2));
}
