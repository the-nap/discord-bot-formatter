import { getSubscriptions } from '#utils/subscriptionsHandler.js';
import { generateReport } from './report/generateReport.js';

export async function autoReport(discordClient){
  const subscriptions = await getSubscriptions();

  const reports = new Map();

  for( let subscription of subscriptions ){

    const channel = discordClient.channels.cache.get(subscription.channel)
    if(!channel)
      console.warn(`Il canale ${subscription.channel} non risulta`);

    try{
      if(!reports.has(subscription.mu))
        reports.set(subscription.mu, await generateReport(subscription.mu, true))
  
      await channel.send({
        embeds: [ reports.get(subscription.mu) ]
      })
  
    }catch (err){
      console.error(err);
      channel.send({
        content: 'Qualcosa è andato storto'
      })
    }
  }
}

export async function commandReport(subscription){
  const muId = subscription.mu;
  return await generateReport(muId);
}
