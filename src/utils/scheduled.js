import cron from 'node-cron';
import { autoReport } from '../scheduled/dailyReport.js';

let discordClient;

export function startScheduler(client){
  discordClient = client;
}

cron.schedule(
  "4 0 * * *",
  async () => {
    autoReport(discordClient);
  },
  {
    timezone: "Europe/Rome",
  }
);
