import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { Client, Events, GatewayIntentBits, MessageFlags, Collection } from 'discord.js';
import config from '#config/config-loader.mjs';
import { startScheduler } from '#utils/scheduled.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const timestamp = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Rome",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
}).format(new Date());

console.log("Running in:", config.environment);
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  startScheduler(client);
});

client.commands = new Collection();
client.buttons = new Collection();

const commandsPath = path.join(__dirname, 'commands', 'slash');
const commandFiles = fs.readdirSync(commandsPath)
  .filter(file => file.endsWith('.js'));

await loadCommands();

const buttonsPath = path.join(__dirname,'commands', 'buttons');
const buttonFiles = fs.readdirSync(buttonsPath)
  .filter(file => file.endsWith('.js'));

await loadButtons();

client.on(Events.InteractionCreate, async (interaction) => {
  const startTime = performance.now();
  try {
    if( interaction.isButton() ){
      const [buttonName] = interaction.customId.split(':');
      const button = interaction.client.buttons.get(buttonName);
      if( !button ){
        console.error(`No button matching ${buttonName} found`);
        return;
      }

      await button.execute(interaction);
    }
    if( interaction.isChatInputCommand() ){
      const command =  interaction.client.commands.get(interaction.commandName);
      console.log(
        `[${timestamp}] ${interaction.user.username} called /${interaction.commandName}`,
        interaction.options.data.length != 0
          ? interaction.options.data
          : ''
      );
      if(!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      await command.execute(interaction);
    }
  } catch (error) {
    console.error(error);
    if ( interaction.replied || interaction.deferred ) {
      await interaction.followUp({
        content: error.message,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: error.message,
        flags: MessageFlags.Ephemeral,
      })
    }
  }finally{
    const endTime = performance.now();
    console.log(`[Time] ${endTime - startTime} milliseconds`);
  }
})

client.login(config.token);

async function loadCommands(){
  for ( const file of commandFiles ) {
    const filePath = path.join(commandsPath, file);
    const commandModule = await import(pathToFileURL(filePath).href);
    const command = commandModule.default; // ESM export
    if ( 'data' in command && 'execute' in command ) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

async function loadButtons(){
  for ( const file of buttonFiles ) {
    const filePath = path.join(buttonsPath, file);
    const buttonModule = await import(pathToFileURL(filePath).href);
    const button = buttonModule.default; // ESM export
    if ( 'name' in button && 'execute' in button ) {
      client.buttons.set(button.name, button);
    } else {
      console.log(`[WARNING] The button at ${filePath} is missing a required "execute" property.`);
    }
  }
}
