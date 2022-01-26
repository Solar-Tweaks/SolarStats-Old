import { InstantConnectProxy } from 'prismarine-proxy';
import { Client } from 'hypixel-api-reborn';
import Listener from './Classes/Listener';
import Player from './Classes/Player';
import { readFileSync } from 'fs';
import { Config } from './Types';
import { version } from 'uuid';
export const config: Config = JSON.parse(readFileSync('./config.json', 'utf8'));

export const hypixelClient = new Client(config.api_key, {
  cache: true,
});

const server = 'hypixel.net';

const proxy = new InstantConnectProxy({
  loginHandler: (client) => ({
    auth: 'microsoft',
    username: client.username,
  }),

  serverOptions: {
    version: '1.8.9',
    motd: 'Hey, this is a test server!',
    port: 25556,
  },

  clientOptions: {
    version: '1.8.9',
    host: server,
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

    client.on('lunarclient:pm', (data) => {
      console.log(data);
    });
  }
});

proxy.on('end', (username) => {
  console.log(`${username} disconnected from the proxy`);
  player.disconnect();
});
