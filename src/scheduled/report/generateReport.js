import { fetchActiveMembers, fetchMu } from "./api.js";
import { processMember, sorter, processMu, removeOldMembers } from "./dataHandling.js";
import { buildEmbed, buildMissingEmbed } from "./embeds.js";
import { loadData, saveData } from "./storage.js";

  export async function generateReport(muId, update = false){

    const data = await loadData();

    const mu = await fetchMu(muId);

    const members = await fetchActiveMembers(mu);

    if(!data[muId]) {
      if(update){
        await initializeMu(data, mu, members)
        await saveData(data);
      }
      return buildMissingEmbed(mu);
    }

    removeOldMembers(data[muId], members);

    const muReport = await processMu(data[muId], mu);

    const membersReport = (await Promise.all(members.map(member => 
      processMember(member, data[muId], update)
    ))).sort(sorter);

    if(update)
      saveData(data);

    return buildEmbed(mu, muReport, membersReport);
  }
