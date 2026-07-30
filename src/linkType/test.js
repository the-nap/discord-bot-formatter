import { createAPIClient } from "@wareraprojects/api";

const client = createAPIClient({ apiKey: 'wae_6a9ef351160aaf0aa59d57c2a6fd7e5137855e9540927128c4bada4b6d21f3bc' });

console.log(Object.values( await client.battleOrder.getByBattle(
  { battleId:'6a69a57ec35eb65da7eb1474', side:'attacker' }))
  .filter( item => item.text != ''));

