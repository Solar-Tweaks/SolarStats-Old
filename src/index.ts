import { InstantConnectProxy } from "prismarine-proxy";
import { Client } from "hypixel-api-reborn";
import Listener from "./Classes/Listener";
import Player from "./Classes/Player";
import { readFileSync } from "fs";
import { Config } from "./Types";
import CommandHandler from "./Classes/CommandHandler";
import dodge from "./commands/dodge";
import reqeue from "./commands/reqeue";

export const config: Config = JSON.parse(readFileSync("./config.json", "utf8"));

export const hypixelClient = new Client(config.api_key, {
  cache: true,
});

const server = "localhost";

const proxy = new InstantConnectProxy({
  loginHandler: (client) => ({
    auth: "microsoft",
    username: client.username,
  }),

  serverOptions: {
    version: "1.8.9",
    motd: "Hey, this is a test server!",
    port: 25556,
  },

  clientOptions: {
    version: "1.8.9",
    host: server,
  },
});
console.log("Proxy started");

export const listener = new Listener(proxy);
export const player = new Player(listener);

export const commandHandler = new CommandHandler(proxy);
commandHandler.registerCommand([
  dodge.setPlayer(player),
  reqeue.setPlayer(player),
]);

proxy.on("incoming", (data, meta, toClient) => {
  toClient.write(meta.name, data);
});

proxy.on("outgoing", (data, meta, toClient, toServer) => {
  // Handling chat packet in Classes/CommandHandler.ts
  if (meta.name === "chat") return;

  toServer.write(meta.name, data);
});

// Triggered when the player connects
// AND changes server (when connected to a proxy like Bungeecord) for some reason
proxy.on("start", (client, server) => {
  if (!player.online) {
    console.log(`${client.username} connected to the proxy`);
    player.connect(client, server);
  }
});

proxy.on("end", (username) => {
  console.log(`${username} disconnected from the proxy`);
  player.disconnect();
});
