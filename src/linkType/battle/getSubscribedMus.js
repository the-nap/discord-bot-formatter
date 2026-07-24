import { getSubscriptions } from "#utils/subscriptionsHandler.js";

export async function getSubscribedMu(context){
  const subscriptions = await getSubscriptions();

  return subscriptions
    .find((item) =>
      item.channel === context.channel 
    )?.mu;

}
