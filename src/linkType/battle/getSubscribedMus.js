import subscriptions from '#state/subscriptions.json' with { type: 'json' }

export function getSubscribedMu(context){

  return subscriptions
    .find((item) =>
      item.channel === context.channel 
    )?.mu;

}
