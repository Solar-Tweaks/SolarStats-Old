import { InstantConnectProxy } from 'prismarine-proxy';
import { createClient } from './utils/hypixel';
import Listener from './Classes/Listener';
import Player from './player/Player';
import getConfig from './utils/config';
import { ping } from 'minecraft-protocol';
import { NIL } from 'uuid';

export const config = getConfig();
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
  },

  clientOptions: {
    version: '1.8.9',
    host: config.server.host,
    port: config.server.port,
  },
});
console.log('Proxy started');

export const listener = new Listener(proxy);
export const player = new Player(listener, proxy);

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
