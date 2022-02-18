import { Status } from 'hypixel-api-reborn';
import { Client } from 'minecraft-protocol';
import { LCPlayer } from '@solar-tweaks/minecraft-protocol-lunarclient';
import { ChatMessage, PlayerInfo, Team } from '../Types';
import { fetchPlayerLocation } from '../utils/hypixel';
import Listener from '../Classes/Listener';
import CommandHandler from '../Classes/CommandHandler';
import { InstantConnectProxy } from 'prismarine-proxy';
import dodge from '../commands/dodge';
import requeue from '../commands/requeue';
import stat from '../commands/stat';
import dumpPackets from '../commands/dumpPackets';
import PlayerModule from './PlayerModule';
import bridgeHeightLimit from './modules/bridgeHeightLimit';
import lunarCooldowns from './modules/lunarCooldowns';
import bedwarsWaypoints from './modules/bedwarsWaypoints';
import bedwarsTeammates from './modules/bedwarsTeammates';

export default class Player {
  public overriddenPackets: { incoming: string[]; outgoing: string[] };
  public online: boolean;
  public uuid?: string;
  public client?: Client;
  public server?: Client;
  public status?: Status;
  public lastGameMode?: string;
  public playerList: PlayerInfo[];
  public listener: Listener;
  public dodging: boolean;
  public teams: Team[];
  public lcPlayer: LCPlayer;
  public proxy: InstantConnectProxy;
  public readonly modules: PlayerModule[];

  public constructor(listener: Listener, proxy: InstantConnectProxy) {
    this.online = false;
    this.listener = listener;
    this.proxy = proxy;

    // Packets that have a custom handling
    this.overriddenPackets = {
      incoming: [],
      outgoing: ['chat', 'block_place'],
    };

    new CommandHandler(proxy).registerCommand([
      dodge.setPlayer(this),
      requeue.setPlayer(this),
      stat.setPlayer(this),
      dumpPackets.setPlayer(this),
    ]);

    this.modules = [
      bridgeHeightLimit.setPlayer(this),
      lunarCooldowns.setPlayer(this),
      bedwarsWaypoints.setPlayer(this),
      bedwarsTeammates.setPlayer(this),
    ];
  }

  public connect(client: Client, server: Client): void {
    this.online = true;
    this.uuid = client.uuid;
    this.client = client;
    this.server = server;
    this.teams = [];
    this.lcPlayer = new LCPlayer(client);

    this.modules.forEach((module) => {
      // @ts-ignore
      this.listener.on(module.event, module.handler);
      module.customCode();
    });

    this.listener.on('switch_server', async () => {
      this.playerList = [];
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
    this.online = false;
    this.uuid = null;
    this.client = null;
    this.status = null;
    this.lastGameMode = null;
    this.playerList = [];
    this.dodging = false;
    this.teams = [];

    this.listener.removeAllListeners();
  }

  public async refreshPlayerLocation(): Promise<void> {
    await fetchPlayerLocation(this.uuid)
      .then((status) => {
        this.status = status;
        if (this.status.mode !== 'LOBBY') this.lastGameMode = this.status.mode;

        this.modules.forEach((module) => {
          module.onLocationUpdate();
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
    if (this.dodging) {
      this.lcPlayer.sendNotification("You're already dodging!", 2500, 'error');

      return;
    }
    this.dodging = true;
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
      if (switched) {
        this.dodging = false;
        return;
      }
      this.executeCommand(command);
    }, 2500);
  }

  public isInGameMode(gamemode: string): boolean {
    if (this.status) return this.status.mode.startsWith(gamemode);
    else return false;
  }

  public sendMessage(
    text: string,
    hoverText?: string,
    showHoverHint = true
  ): void {
    const message: ChatMessage = { text };
    if (hoverText) {
      message.hoverEvent = { action: 'show_text', value: { text: hoverText } };
      if (showHoverHint) message.text += ` §7(Hover for more information)`;
    }
    this.client.write('chat', { message: JSON.stringify(message) });
  }

  public executeCommand(command: string): void {
    this.server.write('chat', { message: command });
  }
}
