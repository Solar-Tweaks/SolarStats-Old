import { EventEmitter } from 'node:events';
import { InstantConnectProxy } from 'prismarine-proxy';
import TypedEmitter from 'typed-emitter';
import { player } from '..';
import { ListenerEvents } from '../Types';
import Logger from './Logger';

export default class Listener extends (EventEmitter as new () => TypedEmitter<ListenerEvents>) {
  public constructor(proxy: InstantConnectProxy) {
    super();
    proxy.on('start', (toClient, toServer) => {
      if (player.online) this.emit('switch_server', toServer);
    });

    proxy.on('incoming', async (data, meta) => {
      // Chat packet
      if (meta.name === 'chat') {
        try {
          // Server Full
          // Triggered when a message like "has joined (X/X)!"
          if (
            data.message.startsWith(
              '{"italic":false,"extra":[{"color":"yellow","text":""}'
            ) &&
            data.message.endsWith(
              '"},{"text":""},{"bold":false,"italic":false,"underlined":false,"obfuscated":false,"strikethrough":false,"text":""},{"color":"yellow","text":")!"},{"color":"yellow","text":""}],"text":""}'
            )
          ) {
            const message: string = JSON.parse(data.message)
              .extra.map((element) => element.text)
              .join('');
            if (message.match(/\(([0-99]*)\/\1\)/g)) {
              const string = message
                .match(/\(([0-99]*)\/\1\)/g)[0]
                .replace(/\D/g, '');
              const maxPlayers = parseInt(
                string.substring(0, string.length / 2)
              );
              await new Promise((resolve) => setTimeout(resolve, 250));
              this.emit('server_full', maxPlayers);
            }
          }
        } catch (error) {
          Logger.error("Couldn't parse chat packet", error);
        }
      }

      if (meta.name === 'set_slot') {
        if (data.windowId === 0 && data.slot === 44) {
          switch (data.item.blockId) {
            case -1:
              this.emit('arrow_slot_empty');
              break;
            case 262:
              this.emit('arrow_slot_filled');
              break;
            default:
              break;
          }
        }
      }

      if (meta.name === 'named_entity_spawn') {
        this.emit('player_spawn', data.playerUUID, data.entityId);
      }

      if (meta.name === 'player_info' && data.action === 0) {
        this.emit('player_join', data.data[0].UUID, data.data[0].name);
      }

      if (meta.name === 'scoreboard_team') {
        switch (data.mode) {
          case 0:
            this.emit('team_create', data.team);
            break;
          case 1:
            this.emit('team_delete', data.team);
            break;
          case 2:
            this.emit('team_edit', data);
            break;
          case 3:
            this.emit('team_player_add', data.team, data.players);
          default:
            break;
        }
      }
    });

    proxy.on('outgoing', (data, meta, toClient, toServer) => {
      if (meta.name === 'block_place') {
        this.emit('place_block', data, toClient, toServer);
      }
    });
  }
}
