import { Status } from 'hypixel-api-reborn';
import { Client } from 'minecraft-protocol';
import { InstantConnectProxy } from 'prismarine-proxy';
import { config } from '..';
import { ChatMessage, Mode, PlayerInfo } from '../Types';
import formatStats from '../utils/formatStats';
import { fetchPlayerData, fetchPlayerLocation } from '../utils/hypixel';
import Listener from './Listener';

export default class Player {
  public online: boolean;
  public uuid?: string;
  public client?: Client;
  public server?: Client;
  public status?: Status;
  public playerList: PlayerInfo[];

  private listener: Listener;
  private proxy: InstantConnectProxy;

  public constructor(listener: Listener, proxy: InstantConnectProxy) {
    this.online = false;

    this.listener = listener;
    this.proxy = proxy;
  }

  public connect(client: Client, server: Client): void {
    this.online = true;
    this.uuid = client.uuid;
    this.client = client;
    this.server = server;
    this.playerList = [];

    this.listener.on('server_full', () => {
      this.sendStats();
    });

    this.listener.on('player_join', (playerInfo) => {
      if (playerInfo.UUID !== this.uuid) {
        const player = this.playerList.find((p) => p.UUID === playerInfo.UUID);
        if (!player) {
          this.playerList.push(playerInfo);
        }
      }
    });

    this.listener.on('player_leave', (uuid) => {
      this.playerList = this.playerList.filter(
        (player) => player.UUID !== uuid
      );
    });

    this.listener.on('switch_server', async (toServer) => {
      this.playerList = [];
      fetchPlayerLocation(this.uuid)
        .then((status) => {
          this.status = status;
        })
        .catch(() => {
          this.status = null;
        });
    });

    this.listener.on('command', async (command, client) => {
      switch (command) {
        case '/d':
        case '/dodge':
          await this.dodge();
          break;
        default:
          break;
      }
    });
  }

  public disconnect(): void {
    if (!this.online) throw new Error("Can't disconnect player if not online");

    this.online = false;
    this.uuid = null;
    this.client = null;
    this.playerList = [];

    this.listener.removeAllListeners('server_full');
    this.listener.removeAllListeners('player_join');
    this.listener.removeAllListeners('player_leave');
    this.listener.removeAllListeners('switch_server');
    this.listener.removeAllListeners('command');
  }

  public async sendStats(): Promise<void> {
    const formattedPlayers: string[] = [];

    let dodged = false;
    for (const player of this.playerList) {
      const playerData = await fetchPlayerData(player.UUID);
      if (playerData) {
        // Returns here may cause a problem, if the server is full before the status is fetched
        if (!this.status) return;
        if (!this.status.mode) return;
        if (playerData.status === this.status.mode) {
          const formattedStats = formatStats(
            playerData,
            this.status.mode as Mode
          );
          formattedPlayers.push(formattedStats.string);

          if (
            config.dodge.enabled &&
            (config.dodge.winStreak <= formattedStats.stats.winstreak ||
              config.dodge.bestWinStreak <= formattedStats.stats.bestWinstreak)
          ) {
            dodged = true;
            await this.dodge(
              `§aWe dodged this game for you because one\n§aor more player(s) have good stats.\n\n§7Stats required to dodge:\n §7- WS: At least §e§l${config.dodge.winStreak}\n §7- BWS: At least §e§l${config.dodge.bestWinStreak}\n\n${formattedStats.string}`
            );
          }
        }
      } else {
        formattedPlayers.push('§cOne player is nicked!');

        if (config.dodge.enabled && config.dodge.nicked) {
          dodged = true;
          await this.dodge(
            '§aWe dodged this game for you because one\n§aor more were nicked.'
          );
        }
      }
    }

    if (dodged && !config.dodge.sendStats) return;
    this.sendMessage(
      `§8§l§m-----------------§r§c§l Solar Stats §r§8§l§m-----------------§r\n\n${formattedPlayers.join(
        '\n'
      )}\n\n§8§l§m-----------------------------------------------`
    );
  }

  public async dodge(stats?: string): Promise<void> {
    this.sendMessage('§a§lDodging!', stats);
    if (!this.status) {
      this.sendMessage('§cYou are not in a game!');
      return;
    }

    this.server.write('chat', {
      message: `/play ${this.status.mode.toLowerCase()}`,
    });

    let switched = false;
    this.listener.once('switch_server', () => {
      switched = true;
    });

    const timeout = 2000;
    setTimeout(() => {
      if (switched) return;
      this.sendMessage(
        `§cSending you back to lobby because of timeout (${timeout}ms)!`
      );

      this.server.write('chat', {
        message: `/lobby`,
      });

      switched = false;
      this.listener.once('switch_server', () => {
        switched = true;
      });

      setTimeout(() => {
        if (switched) return;
        this.client.end(
          `§cKicking you from Hypixel to prevent a dodge not working!\nYou see this message because Hypixel has not sent you to lobby in the last ${timeout}ms!`
        );
      }, timeout);
    }, timeout);
  }

  public async sendMessage(text: string, hoverText?: string): Promise<void> {
    const message: ChatMessage = { text };
    if (hoverText) {
      message.hoverEvent = { action: 'show_text', value: { text: hoverText } };
      message.text += ` §7(Hover for more informations)`;
    }
    this.client.write('chat', { message: JSON.stringify(message) });
  }
}
