import { Status } from 'hypixel-api-reborn';
import { Client } from 'minecraft-protocol';
import { LCPlayer } from '@solar-tweaks/minecraft-protocol-lunarclient';
import { Command, Team } from '../Types';
import { fetchPlayerLocation } from '../utils/hypixel';
import Listener from '../Classes/Listener';
import CommandHandler from '../Classes/CommandHandler';
import { InstantConnectProxy } from 'prismarine-proxy';
import dodge from '../commands/dodge';
import requeue from '../commands/requeue';
import stats from '../commands/stats';
import dumpPackets from '../commands/dumpPackets';
import settings from '../commands/settings';
import debug from '../commands/debug';
import solarsucks from '../commands/solarsucks';
import PlayerModule from './PlayerModule';
import Logger from '../Classes/Logger';

export default class Player {
  public readonly crashedModules: PlayerModule[];
  public readonly listener: Listener;
  public readonly modules: PlayerModule[];
  public readonly proxy: InstantConnectProxy;
  public readonly commandHandler: CommandHandler;

  public client?: Client;
  public lastGameMode?: string;
  public lcPlayer?: LCPlayer;
  public online?: boolean;
  public overriddenPackets: { incoming: string[]; outgoing: string[] };
  public server?: Client;
  public status?: Status;
  public teams?: Team[];
  public uuid?: string;

  public constructor(
    listener: Listener,
    proxy: InstantConnectProxy,
    modules: PlayerModule[]
  ) {
    this.crashedModules = [];
    this.listener = listener;
    this.modules = modules;
    this.proxy = proxy;

    // Packets that have a custom handling
    this.overriddenPackets = {
      incoming: [],
      outgoing: ['chat', 'block_place'],
    };

    this.commandHandler = new CommandHandler(this.proxy).registerCommand([
      dodge.setPlayer(this),
      requeue.setPlayer(this),
      stats.setPlayer(this),
      dumpPackets.setPlayer(this),
      settings.setPlayer(this),
      debug.setPlayer(this),
      solarsucks.setPlayer(this),
    ]);

    this.modules.forEach((module) => module.setPlayer(this));
  }

  public connect(client: Client, server: Client): void {
    this.client = client;
    this.lcPlayer = new LCPlayer(client);
    this.online = true;
    this.server = server;
    this.teams = [];
    this.uuid = client.uuid;

    this.modules.forEach((module) => {
      try {
        // @ts-ignore
        this.listener.on(module.event, module.handler);
        module.customCode();
      } catch (error) {
        this.onModuleCrash(module, error);
      }
    });

    this.listener.on('switch_server', async () => {
      this.teams = [];
      this.lcPlayer.removeAllWaypoints();
      this.lcPlayer.removeAllTeammates();
      await this.refreshPlayerLocation();
    });

    // In case the user reconnects to the server and is directly in a game
    setTimeout(async () => {
      await this.refreshPlayerLocation();
    }, 1500);
  }

  public disconnect(): void {
    this.client = null;
    this.lastGameMode = null;
    this.lcPlayer = null;
    this.online = false;
    this.status = null;
    this.teams = [];
    this.uuid = null;

    this.listener.removeAllListeners();

    this.modules.forEach((module) => module.onDisconnect());
  }

  public async refreshPlayerLocation(): Promise<void> {
    await fetchPlayerLocation(this.uuid)
      .then((status) => {
        this.status = status;
        if (this.status.mode !== 'LOBBY') this.lastGameMode = this.status.mode;

        this.modules.forEach((module) => {
          try {
            module.onLocationUpdate();
          } catch (error) {
            this.onModuleCrash(module, error);
          }
        });
      })
      .catch(() => {
        this.status = null;
      });
  }

  public async dodge(): Promise<void> {
    if (!this.status) return;
    if (!this.status.mode) return;
    if (this.status.mode === 'LOBBY') return;
    this.lcPlayer.sendNotification('Dodging game...', 2500);
    const command = `/play ${this.status.mode.toLocaleLowerCase()}`;
    this.executeCommand('/lobby blitz');
    await new Promise((resolve) => setTimeout(resolve, 2500));
    this.executeCommand(command);

    let switched = false;
    this.listener.once('switch_server', () => {
      switched = true;
    });

    setTimeout(() => {
      if (switched) return;

      this.executeCommand(command);
    }, 2500);
  }

  public isInGameMode(gamemode: string): boolean {
    if (this.status) return this.status.mode.startsWith(gamemode);
    else return false;
  }

  public sendMessage(text: string): void {
    this.client.write('chat', { message: JSON.stringify({ text }) });
  }

  public executeCommand(command: string): void {
    this.server.write('chat', { message: command });
  }

  private onModuleCrash(module: PlayerModule, error): void {
    this.sendMessage(
      `§cError while executing module ${module.name}!\n§cDisabling module...`
    );
    this.listener.removeAllListeners(module.event);
    this.modules.splice(this.modules.indexOf(module), 1);
    Logger.error(`Error while executing module ${module.name}!`, error);
    this.crashedModules.push(module);
  }
}
