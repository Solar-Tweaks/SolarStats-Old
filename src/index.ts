import axios from 'axios';
import * as chalk from 'chalk';
import { ping } from 'minecraft-protocol';
import { readdirSync, readFileSync } from 'node:fs';
import * as https from 'node:https';
import { join } from 'node:path';
import { InstantConnectProxy } from 'prismarine-proxy';
import { NIL } from 'uuid';
import Listener from './Classes/Listener';
import Logger from './Classes/Logger';
import Player from './player/Player';
import PlayerModule from './player/PlayerModule';
import getConfig, { readConfig } from './utils/config';
import { createClient } from './utils/hypixel';
import setupTray from './utils/systray';
import update from './utils/updater';

export async function reloadConfig() {
  config = await readConfig();
}
export const isPacked: boolean = Object.prototype.hasOwnProperty.call(
  process,
  'pkg'
);
export const version = JSON.parse(
  readFileSync(
    isPacked ? join(__dirname, '..', 'package.json') : 'package.json',
    'utf8'
  )
).version;
export let config = getConfig();
export const hypixelClient = createClient(config.apiKey);

console.log(`\n   _____       _               _____ _        _       
  / ____|     | |             / ____| |      | |      
 | (___   ___ | | __ _ _ __  | (___ | |_ __ _| |_ ___ 
  \\___ \\ / _ \\| |/ _\` | '__|  \\___ \\| __/ _\` | __/ __|
  ____) | (_) | | (_| | |     ____) | || (_| | |_\\__ \\
 |_____/ \\___/|_|\\__,_|_|    |_____/ \\__\\__,_|\\__|___/`);
let versionString = '';
for (let i = 0; i < 52 - version.length; i++) versionString += ' ';
console.log(`${versionString}v${version}\n`);

if (
  process.platform === 'win32' &&
  config.checkForUpdates &&
  !process.argv.includes('--skipUpdater')
)
  update();

let hypixelLatency = 0;
const proxy = new InstantConnectProxy({
  loginHandler: (client) => ({
    auth: 'microsoft',
    username: client.username,
  }),

  serverOptions: {
    version: '1.8.9',
    motd: '§cSolar Stats Proxy',
    port: 25556,
    beforeServerInfo: async (response, client, callback) => {
      response = await ping({
        host: config.server.host,
        port: config.server.port,
        version: client.version,
      });
      hypixelLatency = response.latency;
      response.players.sample = [{ name: '§cSolar Stats Proxy', id: NIL }];

      callback(null, response);
    },
    beforePing: (client, packet) => {
      setTimeout(() => {
        client.write('ping', { time: packet.time });
        client.end();
      }, hypixelLatency);
    },
    validateChannelProtocol: false,
  },

  clientOptions: {
    version: '1.8.9',
    host: config.server.host,
    port: config.server.port,
    validateChannelProtocol: false,
  },
});
Logger.info('Proxy started');

export const listener = new Listener(proxy);

const modules: PlayerModule[] = [];
readdirSync(join(__dirname, 'player', 'modules')).forEach((file) => {
  try {
    if (!file.endsWith('.js')) return;
    const module = require(join(__dirname, 'player', 'modules', file)).default;

    if (module instanceof PlayerModule) modules.push(module);
    else Logger.warn(`Module in file ${file} is not a valid module.`);
  } catch (error) {
    Logger.error(`Couldn't load module ${file}`, error);
  }
});

export const player = new Player(listener, proxy, modules);

proxy.on('incoming', (data, meta, toClient) => {
  if (player.overriddenPackets.incoming.includes(meta.name)) return;

  toClient.write(meta.name, data);
});

proxy.on('outgoing', (data, meta, toClient, toServer) => {
  if (player.overriddenPackets.outgoing.includes(meta.name)) return;
  // Custom inventories
  if (meta.name === 'window_click' && data.windowId === 255) return;

  toServer.write(meta.name, data);
});

// Triggered when the player connects
// AND changes server (when connected to a proxy like Bungeecord) for some reason
proxy.on('start', (client, server) => {
  if (!player.online) {
    Logger.info(`${chalk.italic.bold(client.username)} connected to the proxy`);
    player.connect(client, server);
  }
});

proxy.on('end', (username) => {
  Logger.info(`${chalk.italic.bold(username)} disconnected from the proxy`);
  player.disconnect();
});

setupTray();

// Statistics
if (config.statistics && !process.argv.includes('--noTracking'))
  axios
    .post(
      'https://server.solartweaks.com/api/launch',
      {
        item: 'solarstats',
      },
      {
        // Safe because not transmitting sensitive data
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      }
    )
    .catch((error) =>
      Logger.error('An error occurred while sending statistics', error)
    );
