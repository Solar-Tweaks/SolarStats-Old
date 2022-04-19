import { InstantConnectProxy } from 'prismarine-proxy';
import { createClient } from './utils/hypixel';
import Listener from './Classes/Listener';
import Player from './player/Player';
import getConfig, { readConfig } from './utils/config';
import { ping } from 'minecraft-protocol';
import { NIL } from 'uuid';
import axios from 'axios';
import * as https from 'https';
import Logger from './Classes/Logger';
import * as chalk from 'chalk';
import update from './utils/updater';

console.log(`\n   _____       _               _____ _        _       
  / ____|     | |             / ____| |      | |      
 | (___   ___ | | __ _ _ __  | (___ | |_ __ _| |_ ___ 
  \\___ \\ / _ \\| |/ _\` | '__|  \\___ \\| __/ _\` | __/ __|
  ____) | (_) | | (_| | |     ____) | || (_| | |_\\__ \\
 |_____/ \\___/|_|\\__,_|_|    |_____/ \\__\\__,_|\\__|___/\n\n`);

export let config = getConfig();
export const hypixelClient = createClient(config.apiKey);

if (
  process.platform === 'win32' &&
  config.checkForUpdates &&
  !process.argv.includes('--skipUpdater')
)
  update();

const proxy = new InstantConnectProxy({
  loginHandler: (client) => ({
    auth: 'microsoft',
    username: client.username,
  }),

  serverOptions: {
    version: '1.8.9',
    motd: '§cSolar Stats Proxy',
    port: 25556,
    beforePing: async (response, client, callback) => {
      response = await ping({
        host: config.server.host,
        port: config.server.port,
        version: client.version,
      });
      response.players.sample = [{ name: '§cSolar Stats Proxy', id: NIL }];

      callback(null, response);
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

/* Player Modules */
import PlayerModule from './player/PlayerModule';
import bridgeHeightLimit from './player/modules/bridgeHeightLimit';
import lunarCooldowns from './player/modules/lunarCooldowns';
import bedwarsWaypoints from './player/modules/bedwarsWaypoints';
import bedwarsTeammates from './player/modules/bedwarsTeammates';
import mvpPlusPlusEmotes from './player/modules/mvpPlusPlusEmotes';

let stats: PlayerModule | undefined;
try {
  stats = require('./player/modules/stats').default;
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
  Logger.warn('Could not load stats module, this is expected.');
}

const modules = [
  bridgeHeightLimit,
  lunarCooldowns,
  bedwarsWaypoints,
  bedwarsTeammates,
  mvpPlusPlusEmotes,
];
if (stats instanceof PlayerModule) modules.push(stats);

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

export async function reloadConfig() {
  config = await readConfig();
}
export const isPacked: boolean = Object.prototype.hasOwnProperty.call(
  process,
  'pkg'
);

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
