import subscriptions from '#state/subscriptions.json' with { type: 'json' };
import { generateReport } from './report/generateReport.js';

export async function autoReport(discordClient){

  for( let subscription of subscriptions ){
    const channel = discordClient.channels.cache.get(subscription.channel)
    await channel.send({
      embeds: [ await generateReport(subscription.mu, true)]
    })
  }
}

export async function commandReport(subscription){
  const muId = subscription.mu;
  return await generateReport(muId);
}
