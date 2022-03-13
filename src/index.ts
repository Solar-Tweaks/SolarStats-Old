import { InstantConnectProxy } from 'prismarine-proxy';
import { createClient } from './utils/hypixel';
import Listener from './Classes/Listener';
import Player from './player/Player';
import getConfig, { readConfig } from './utils/config';
import { ping } from 'minecraft-protocol';
import { NIL } from 'uuid';

export let config = getConfig();
export const hypixelClient = createClient(config.apiKey);

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
    // @ts-ignore
    validateChannelProtocol: false,
  },

  clientOptions: {
    version: '1.8.9',
    host: config.server.host,
    port: config.server.port,
    // @ts-ignore
    validateChannelProtocol: false,
  },
});
console.log('Proxy started');

export const listener = new Listener(proxy);

/* Player Modules */
import bridgeHeightLimit from './player/modules/bridgeHeightLimit';
import lunarCooldowns from './player/modules/lunarCooldowns';
import bedwarsWaypoints from './player/modules/bedwarsWaypoints';
import bedwarsTeammates from './player/modules/bedwarsTeammates';

export const player = new Player(listener, proxy, [
  bridgeHeightLimit,
  lunarCooldowns,
  bedwarsWaypoints,
  bedwarsTeammates,
]);

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
    console.log(`${client.username} connected to the proxy`);
    player.connect(client, server);
  }
});

proxy.on('end', (username) => {
  console.log(`${username} disconnected from the proxy`);
  player.disconnect();
});

export async function reloadConfig() {
  config = await readConfig();
}
