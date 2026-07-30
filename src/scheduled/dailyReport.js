import { getSubscriptions } from '#utils/subscriptionsHandler.js';
import { withToggleViewButton } from '../commands/buttons/toggleViewButton.js';
import { generateReport } from './report/generateReport.js';

export async function autoReport(discordClient){
  const subscriptions = await getSubscriptions();

  const reports = new Map();

  for( let subscription of subscriptions ){

    const channel = discordClient.channels.cache.get(subscription.channel)
    if(!channel){
      console.warn(`Il canale ${subscription.channel} non risulta`);
      continue;
    }

    try{
      if(!reports.has(subscription.mu))
        reports.set(subscription.mu, await generateReport(subscription.mu, true))

      const result = reports.get(subscription.mu);
  
      const message = await channel.send({
        embeds: [ result.embed ]
      })

      await message.edit(
        withToggleViewButton(message.id, result)
      )
  
    } catch (err) {
      console.error(err);
      console.error(`Error on channel: ${channel.name}`);

      try {
        await channel.send({
          content: 'Qualcosa è andato storto'
        });
      } catch (sendError) {
        console.error('Could not send error message:', sendError);
      }
    }
  }
}

export async function commandReport(subscription){
  const muId = subscription.mu;
  return await generateReport(muId);
}
