import { Status } from 'hypixel-api-reborn';
import { Client } from 'minecraft-protocol';
import {
  registerClient,
  channel as lcChannel,
} from '@solar-tweaks/minecraft-protocol-lunarclient';
import { config } from '..';
import { ChatMessage, PlayerInfo, Team, Waypoint } from '../Types';
import { fetchPlayerLocation } from '../utils/hypixel';
import Listener from './Listener';
import CommandHandler from './CommandHandler';
import { InstantConnectProxy } from 'prismarine-proxy';
import dodge from '../commands/dodge';
import requeue from '../commands/requeue';
import stat from '../commands/stat';
import dumpPackets from '../commands/dumpPackets';
import WaypointsMappings from '../utils/WaypointsMappings';
import axios from 'axios';

export default class Player {
  public online: boolean;
  public uuid?: string;
  public client?: Client;
  public server?: Client;
  public status?: Status;
  public lastGameMode?: string;
  public playerList: PlayerInfo[];
  public listener: Listener;
  public dodging: boolean;
  public loadedWaypoints: Waypoint[];
  public teammates: string[];
  public cooldowns: string[];
  public teams: Team[];
  public overriddenPackets: { incoming: string[]; outgoing: string[] };
  public proxy: InstantConnectProxy;

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
  }

  public connect(client: Client, server: Client): void {
    this.online = true;
    this.uuid = client.uuid;
    this.client = client;
    this.server = server;
    this.loadedWaypoints = [];
    this.teammates = [];
    this.cooldowns = [];
    this.teams = [];

    registerClient(this.client);
    this.sendNotification('Thanks for using Solar Stats!');

    this.listener.on('switch_server', async () => {
      this.playerList = [];
      this.teams = [];
      this.removeAllWaypoints();
      await this.refreshPlayerLocation();
      await this.sendTeammates();
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

    this.listener.on('arrow_slot_empty', () => {
      if (config.lunarCooldowns && this.isInGameMode('DUELS_BRIDGE_')) {
        this.setCooldown('hypixel_bow', 3500, 261);
      }
    });

    this.listener.on('arrow_slot_filled', () => {
      if (config.lunarCooldowns && this.isInGameMode('DUELS_BRIDGE_')) {
        this.setCooldown('hypixel_bow', 0, 261);
      }
    });

    this.listener.on('team_create', (name) => {
      const existingTeam = this.teams.find((team) => team.name === name);
      if (existingTeam) return;
      this.teams.push({
        name,
        players: [],
      });
    });

    this.listener.on('team_delete', (name) => {
      this.teams = this.teams.filter((team) => team.name !== name);
    });

    this.listener.on('team_player_add', (name, players) => {
      this.teams.find((team) => team.name === name)?.players.push(...players);

      const playerTeam = this.teams.find((team) =>
        team.players.includes(this.client.username)
      );

      if (!playerTeam) return;
      if (playerTeam?.name !== name) return;

      const bedwarsTeams = [
        'Red',
        'Blue',
        'Green',
        'Yellow',
        'Aqua',
        'White',
        'Pink',
        'Gray',
      ];
      bedwarsTeams.forEach(async (bedwarsTeam) => {
        if (!playerTeam.name.startsWith(bedwarsTeam)) return;

        await new Promise((resolve) => setTimeout(resolve, 500));
        const allTeams = this.teams.filter((team) =>
          team.name.startsWith(bedwarsTeam)
        );
        allTeams.forEach((team) => {
          this.teammates = this.teammates.concat(team.players);
        });
        await this.sendTeammates();
      });
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
    this.loadedWaypoints = [];
    this.teammates = [];
    this.cooldowns = [];
    this.teams = [];

    this.listener.removeAllListeners();
  }

  public async refreshPlayerLocation(): Promise<void> {
    await fetchPlayerLocation(this.uuid)
      .then((status) => {
        this.status = status;

        if (this.status.mode !== 'LOBBY') this.lastGameMode = this.status.mode;

        if (
          config.bedwarsWaypoints &&
          this.status.game.code === 'BEDWARS' &&
          this.status.map
        )
          this.loadBedwarsWaypoints();
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
      this.sendNotification("You're already dodging!", 'error');
      return;
    }
    this.dodging = true;
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

  public loadBedwarsWaypoints(): void {
    const map = this.status.map;
    const mapError = () => {
      this.sendNotification(`Couldn't find waypoints for ${map}`, 'error');
    };
    if (Object.prototype.hasOwnProperty.call(WaypointsMappings, map)) {
      const mapMappings = WaypointsMappings[map].find((mapping) =>
        mapping.modes.includes(this.status.mode)
      );
      if (mapMappings)
        mapMappings.waypoints.forEach((waypoint) => {
          this.addWaypoint(waypoint);
        });
      else mapError();
    } else mapError();
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

  public setCooldown(
    message: string,
    durationMs: number,
    iconId: number
  ): void {
    // Should work but it does not for some reason
    // this.client.writeChannel(lcChannel, {
    //   id: 'cooldown',
    //   message,
    //   durationMs: 2000,
    //   iconId,
    // });

    // Manually building the packet
    // This needs to be changed! This can't be used in production
    let packet = '030b';
    packet += Buffer.from(message, 'utf8').toString('hex');
    packet += '000000000000';

    const durationMsHex = durationMs.toString(16);
    for (let index = 0; index < 4 - durationMsHex.length; index++) {
      packet += '0';
    }
    packet += durationMsHex;

    packet += '00000';
    packet += iconId.toString(16);

    if (durationMs > 0) this.cooldowns.push(message);
    else this.cooldowns.splice(this.cooldowns.indexOf(message), 1);

    this.client.write('custom_payload', {
      channel: lcChannel,
      data: Buffer.from(packet, 'hex'),
    });
  }

  public spoofDisplayName(playerUuid: string, displayName: string): void {
    this.client.write('player_info', {
      action: 3,
      uuid: playerUuid,
      displayName,
    });
  }

  public async sendTeammates(): Promise<void> {
    const players = [];
    for (const playerName of this.teammates) {
      // This needs to be changed!
      // We should use the player_info packet instead of making a request to Mojang
      const response = await axios
        .get(`https://api.mojang.com/users/profiles/minecraft/${playerName}`)
        .catch(() => {
          // Ignoring fake players
        });
      if (!response) return;
      players.push({
        player:
          response.data.id.substr(0, 8) +
          '-' +
          response.data.id.substr(8, 4) +
          '-' +
          response.data.id.substr(12, 4) +
          '-' +
          response.data.id.substr(16, 4) +
          '-' +
          response.data.id.substr(20),
        posMap: [
          { key: 'x', value: 0 },
          { key: 'y', value: 0 },
          { key: 'z', value: 0 },
        ],
      });
    }

    this.client.writeChannel(lcChannel, {
      id: 'teammates',
      leader: this.client.uuid,
      lastMs: 0,
      players,
    });
  }
}
