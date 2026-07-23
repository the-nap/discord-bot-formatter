import subscriptions from '#state/subscriptions.json' with { type: 'json' }

export function getSubscribedMu(context){

  performance.now();
  return subscriptions
    .filter(
      (item) =>
        item.channel === context.channel )
    .map( item => item?.mu );

}
