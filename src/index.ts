import { InstantConnectProxy } from 'prismarine-proxy';
import { createClient } from './utils/hypixel';
import Listener from './Classes/Listener';
import Player from './Classes/Player';
import getConfig from './utils/config';
import { ping } from 'minecraft-protocol';

export const config = getConfig();

export const hypixelClient = createClient(config.apiKey);

const proxy = new InstantConnectProxy({
  loginHandler: (client) => ({
    auth: 'microsoft',
    username: client.username,
  }),

  serverOptions: {
    version: '1.8.9',
    motd: 'Hey, this is a test server!',
    port: 25556,
    beforePing: async (response, client, callback) => {
      response = await ping({
        host: config.server.host,
        port: config.server.port,
        version: '1.8.9',
      });
      // @ts-ignore - Types are wrong, I'll remove this when they will accept my pull request
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
  toClient.write(meta.name, data);
});

proxy.on('outgoing', (data, meta, toClient, toServer) => {
  // Handling chat packet in Classes/CommandHandler.ts
  if (meta.name === 'chat') return;
  // Handling block place packet in Classes/Listener.ts
  if (meta.name === 'block_place') return;

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
