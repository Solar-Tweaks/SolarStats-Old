import { Status } from "hypixel-api-reborn";
import { Client } from "minecraft-protocol";
import { config } from "..";
import { ChatMessage, Mode, PlayerInfo } from "../Types";
import formatStats from "../utils/formatStats";
import { fetchPlayerData, fetchPlayerLocation } from "../utils/hypixel";
import Listener from "./Listener";

export default class Player {
  public online: boolean;
  public uuid?: string;
  public client?: Client;
  public server?: Client;
  public status?: Status;
  public lastGameMode?: string;
  public playerList: PlayerInfo[];
  public listener: Listener;

  public constructor(listener: Listener) {
    this.online = false;

    this.listener = listener;
  }

  public connect(client: Client, server: Client): void {
    this.online = true;
    this.uuid = client.uuid;
    this.client = client;
    this.server = server;
    this.playerList = [];

    this.listener.on("server_full", async () => {
      await this.sendStats();
    });

    this.listener.on("player_join", (playerInfo) => {
      if (playerInfo.UUID !== this.uuid) {
        const player = this.playerList.find((p) => p.UUID === playerInfo.UUID);
        if (!player) {
          this.playerList.push(playerInfo);
        }
      }
    });

    this.listener.on("player_leave", (uuid) => {
      this.playerList = this.playerList.filter(
        (player) => player.UUID !== uuid
      );
    });

    this.listener.on("switch_server", () => {
      this.playerList = [];
      fetchPlayerLocation(this.uuid)
        .then((status) => {
          this.status = status;

          if (this.status.mode !== "LOBBY")
            this.lastGameMode = this.status.mode;
        })
        .catch(() => {
          this.status = null;
        });
    });
  }

  public disconnect(): void {
    this.online = false;
    this.uuid = null;
    this.client = null;
    this.status = null;
    this.lastGameMode = null;
    this.playerList = [];

    this.listener.removeAllListeners("server_full");
    this.listener.removeAllListeners("player_join");
    this.listener.removeAllListeners("player_leave");
    this.listener.removeAllListeners("switch_server");
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

          if (!formattedStats.stats) return;

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
        formattedPlayers.push("§cOne player is nicked!");

        if (config.dodge.enabled && config.dodge.nicked) {
          dodged = true;
          await this.dodge(
            "§aWe dodged this game for you because one\n§aor more player(s) were nicked."
          );
        }
      }
    }

    if (dodged && !config.dodge.sendStats) return;
    this.sendMessage(
      `§8§l§m-----------------§r§c§l Solar Stats §r§8§l§m-----------------§r\n\n${formattedPlayers.join(
        "\n"
      )}\n\n§8§l§m-----------------------------------------------`
    );
  }

  public async dodge(stats?: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.sendMessage("§a§lDodging!", stats);
      if (!this.status) {
        this.sendMessage("§cYou are not in a game!");
        return;
      }
      if (this.status.mode === "LOBBY") {
        this.sendMessage("§cYou are not in a game!");
        return;
      }

      this.executeCommand(`/play ${this.status.mode.toLowerCase()}`);

      let switched = false;
      this.listener.once("switch_server", () => {
        switched = true;
        resolve(true);
      });

      const timeout = 2000;
      setTimeout(() => {
        if (switched) return;
        resolve(false);
        this.sendMessage(
          `§cSending you back to lobby because of timeout (${timeout}ms)!`
        );

        this.executeCommand("/lobby");

        switched = false;
        this.listener.once("switch_server", () => {
          switched = true;
        });

        setTimeout(() => {
          if (switched) return;
          resolve(false);
          this.client.end(
            `§cKicking you from Hypixel to prevent a dodge not working!\nYou see this message because Hypixel has not sent you to lobby in the last ${timeout}ms!`
          );
        }, timeout);
      }, timeout);
    });
  }

  public sendMessage(
    text: string,
    hoverText?: string,
    showHoverHint = true
  ): void {
    const message: ChatMessage = { text };
    if (hoverText) {
      message.hoverEvent = { action: "show_text", value: { text: hoverText } };
      if (showHoverHint) message.text += ` §7(Hover for more informations)`;
    }
    this.client.write("chat", { message: JSON.stringify(message) });
  }

  public executeCommand(command: string): void {
    this.server.write("chat", { message: command });
  }
}
