import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { ListenerEvents } from '../Types';
import { InstantConnectProxy } from 'prismarine-proxy';
import { player } from '..';

export default class Listener extends (EventEmitter as new () => TypedEmitter<ListenerEvents>) {
  public constructor(proxy: InstantConnectProxy) {
    super();

    proxy.on('start', (toClient, toServer) => {
      if (player.online) this.emit('switch_server', toServer);
    });

    proxy.on('incoming', (data, meta) => {
      // Chat packet
      if (meta.name === 'chat') {
        try {
          // Server Full
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
              this.emit('server_full', maxPlayers);
            }
          }
        } catch (error) {
          console.error("Couldn't parse chat packet", error);
        }
      }

      // Player Info packet
      if (meta.name === 'player_info') {
        // Player join
        if (data.action === 0) {
          this.emit('player_join', data.data[0]);
        }

        // Player leave
        if (data.action === 4) {
          try {
            this.emit('player_leave', data.data[0].UUID);
          } catch {}
        }
      }
    });
  }
}
