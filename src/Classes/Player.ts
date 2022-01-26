import { Status } from 'hypixel-api-reborn';
import { Client } from 'minecraft-protocol';
import {
  registerClient,
  channel as lcChannel,
} from '@solar-tweaks/minecraft-protocol-lunarclient';
import { config } from '..';
import { ChatMessage, PlayerInfo, Waypoint } from '../Types';
import { fetchPlayerLocation } from '../utils/hypixel';
import Listener from './Listener';
import CommandHandler from './CommandHandler';
import { InstantConnectProxy } from 'prismarine-proxy';
import dodge from '../commands/dodge';
import requeue from '../commands/requeue';
import stat from '../commands/stat';
import WaypointsMappings from '../utils/WaypointsMappings';

export default class Player {
  public online: boolean;
  public uuid?: string;
  public client?: Client;
  public server?: Client;
  public status?: Status;
  public lastGameMode?: string;
  public playerList: PlayerInfo[];
  public listener: Listener;
  public dodgeing: boolean;
  public loadedWaypoints: Waypoint[];
  public teammates: string[];

  public constructor(listener: Listener, proxy: InstantConnectProxy) {
    this.online = false;
    this.listener = listener;

    new CommandHandler(proxy).registerCommand([
      dodge.setPlayer(this),
      requeue.setPlayer(this),
      stat.setPlayer(this),
    ]);
  }

  public connect(client: Client, server: Client): void {
    this.online = true;
    this.uuid = client.uuid;
    this.client = client;
    this.server = server;
    this.loadedWaypoints = [];
    this.teammates = [];

    registerClient(this.client);
    this.sendNotification('Thanks for using Solar Stats!');

    this.listener.on('switch_server', async () => {
      this.playerList = [];
      this.removeAllWaypoints();
      await fetchPlayerLocation(this.uuid)
        .then((status) => {
          this.status = status;

          if (this.status.mode !== 'LOBBY')
            this.lastGameMode = this.status.mode;
        })
        .catch(() => {
          this.status = null;
        });

      if (
        config.bedwarsWaypoints &&
        this.status.game.code === 'BEDWARS' &&
        this.status.map
      )
        await this.loadBedwarsWaypoints();
    });

    this.listener.on('place_block', (packet, toClient, toServer) => {
      if (this.status && config.heightLimitDelayFix) {
        if (
          this.status.mode.includes('DUELS_BRIDGE_') &&
          ((packet.location.y === 99 && packet.direction === 1) ||
            packet.location.y > 99) &&
          packet.heldItem.blockId === 159
        ) {
          const realBlockLocation = {
            x: packet.location.x,
            y: packet.location.y,
            z: packet.location.z,
          };
          switch (packet.direction) {
            case 0:
              realBlockLocation.x = packet.location.x - 1;
              break;
            case 1:
              realBlockLocation.y = packet.location.y + 1;
              break;
            case 2:
              realBlockLocation.z = packet.location.z - 1;
              break;
            case 3:
              realBlockLocation.z = packet.location.z + 1;
              break;
            case 4:
              realBlockLocation.x = packet.location.x - 1;
              break;
            case 5:
              realBlockLocation.x = packet.location.x + 1;
              break;
            default:
              break;
          }
          toClient.write('block_change', {
            location: realBlockLocation,
            type: 0,
          });
          return;
        }
      }
      toServer.write('block_place', packet);
    });
  }

  public disconnect(): void {
    this.online = false;
    this.uuid = null;
    this.client = null;
    this.status = null;
    this.lastGameMode = null;
    this.playerList = [];
    this.dodgeing = false;
    this.loadedWaypoints = [];
    this.teammates = [];

    this.listener.removeAllListeners();
  }

  public async dodge(): Promise<void> {
    if (!this.status) return;
    if (!this.status.mode) return;
    if (this.status.mode === 'LOBBY') return;
    if (this.dodgeing) {
      this.sendNotification("You're already dodging!", 'error');
      return;
    }
    this.dodgeing = true;
    this.sendNotification('Dodging game...');
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
        this.dodgeing = false;
        return;
      }
      this.executeCommand(command);
    }, 2500);
  }

  public async loadBedwarsWaypoints(): Promise<void> {
    const map = this.status.map;
    if (Object.prototype.hasOwnProperty.call(WaypointsMappings, map)) {
      const mapMappings = WaypointsMappings[map].find((mapping) =>
        mapping.modes.includes(this.status.mode)
      );
      if (mapMappings)
        mapMappings.waypoints.forEach((waypoint) => {
          this.addWaypoint(waypoint);
        });
    }
  }

  public sendMessage(
    text: string,
    hoverText?: string,
    showHoverHint = true
  ): void {
    const message: ChatMessage = { text };
    if (hoverText) {
      message.hoverEvent = { action: 'show_text', value: { text: hoverText } };
      if (showHoverHint) message.text += ` §7(Hover for more informations)`;
    }
    this.client.write('chat', { message: JSON.stringify(message) });
  }

  public sendNotification(
    message: string,
    level: 'error' | 'info' | 'success' | 'warning' = 'info',
    durationMs = 5000
  ): void {
    this.client.writeChannel(lcChannel, {
      id: 'notification',
      message,
      durationMs,
      level,
    });
  }

  public executeCommand(command: string): void {
    this.server.write('chat', { message: command });
  }

  public addWaypoint(waypoint: Waypoint): void {
    const loaded = this.loadedWaypoints.find((wp) => wp.name === waypoint.name);
    if (loaded) return;
    this.loadedWaypoints.push(waypoint);
    this.client.writeChannel(lcChannel, {
      id: 'waypoint_add',
      name: waypoint.name,
      world: '',
      color: waypoint.color,
      x: waypoint.x,
      y: waypoint.y,
      z: waypoint.z,
      forced: false,
      visible: true,
    });
  }

  public removeWaypoint(waypointName: string): void {
    const loaded = this.loadedWaypoints.find((wp) => wp.name === waypointName);
    if (!loaded) return;
    this.loadedWaypoints = this.loadedWaypoints.filter(
      (wp) => wp.name !== waypointName
    );
    this.client.writeChannel(lcChannel, {
      id: 'waypoint_remove',
      name: waypointName,
      world: '',
    });
  }

  public removeAllWaypoints(): void {
    this.loadedWaypoints.forEach((waypoint) => {
      this.removeWaypoint(waypoint.name);
    });
    this.loadedWaypoints = [];
  }

  public spoofDisplayName(playerUuid: string, displayName: string): void {
    this.client.write('player_info', {
      action: 3,
      uuid: playerUuid,
      displayName,
    });
  }
}
