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
          console.error("Couldn't parse chat packet", error);
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
