import cron from 'node-cron';

let client;

export function startScheduler(client){
  client = client;
}

cron.schedule(
  "0 0 * * *",
  async () => {
    autoReport(client);
  },
);
