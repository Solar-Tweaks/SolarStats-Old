import { Client, PacketMeta } from 'minecraft-protocol';
import { EventEmitter } from 'node:events';
import { InstantConnectProxy } from 'prismarine-proxy';
import TypedEmitter from 'typed-emitter';
import Player from '../player/Player';
import { InventoryEvents, InventoryType } from '../Types';
import Item from './Item';

export default class Inventory extends (EventEmitter as new () => TypedEmitter<InventoryEvents>) {
  public items: { [key: string]: Item };
  public type: InventoryType;
  public title: string;
  public slotCount: number;
  public opened: boolean;

  public incomingPacketHandler: (data, meta) => void;
  public outgoingPacketHandler: (data, meta, toClient, toServer) => void;

  public constructor(
    inventoryType: InventoryType,
    title = 'Inventory',
    slotCount = 27
  ) {
    super();
    this.items = {};
    this.type = inventoryType;
    this.title = title;
    this.slotCount = slotCount;
    this.opened = false;
  }

  public addItem(item: Item, position?: number): void {
    const finalPosition = position || Object.keys(this.items).length;
    this.items[finalPosition.toString()] = item;
  }

  public addItems(items: { item: Item; position?: number }[]): void {
    for (const item of items) {
      this.addItem(item.item, item.position);
    }
  }

  public removeItem(position: number): void {
    delete this.items[position.toString()];
  }

  public clear(): void {
    this.items = {};
  }

  public display(player: Player): void {
    this.opened = true;
    player.client.write('open_window', {
      windowId: 50,
      inventoryType: this.type,
      windowTitle: `{"translate":"${this.title}"}`,
      slotCount: this.slotCount,
      entityId: undefined,
    });

    const items = [];

    for (let i = 0; i < this.slotCount; i++) {
      const item = this.items[i.toString()];
      if (item) {
        items.push(item.slotRepresentation);
      } else {
        items.push(Item.emptyItem);
      }
    }

    player.client.write('window_items', {
      windowId: 50,
      items,
    });

    this.setupPacketHandlers(player.proxy);
    player.proxy.on('incoming', this.incomingPacketHandler);
    player.proxy.on('outgoing', this.outgoingPacketHandler);
  }

  public close(player: Player): void {
    if (!this.opened) return;

    this.markAsClosed(player.proxy);
    player.client.write('close_window', {
      windowId: 50,
    });
  }

  public setSlot(client: Client, item: Item, slot: number): void {
    client.write('set_slot', {
      windowId: 50,
      slot,
      item: item.slotRepresentation,
    });
  }

  private markAsClosed(proxy: InstantConnectProxy): void {
    this.emit('close');
    this.opened = false;

    proxy.removeListener('incoming', this.incomingPacketHandler);
    proxy.removeListener('outgoing', this.outgoingPacketHandler);
  }

  private setupPacketHandlers(proxy: InstantConnectProxy): void {
    this.incomingPacketHandler = (data, meta) => {
      if (meta.name === 'open_window') this.markAsClosed(proxy);
    };

    this.outgoingPacketHandler = (
      data,
      meta: PacketMeta,
      toClient: Client,
      toServer: Client
    ) => {
      if (meta.name === 'close_window')
        if (data.windowId === 50 && this.opened) this.markAsClosed(proxy);

      if (meta.name === 'window_click') {
        if (
          data.windowId === 50 &&
          this.opened &&
          data.slot < this.slotCount &&
          data.slot !== -999
        ) {
          this.emit('click', {
            button: data.mouseButton,
            mode: data.mode,
            slot: data.slot,
            toServer: toServer,
            raw: data,
            cancel: (client: Client) => {
              client.write('set_slot', {
                windowId: -1,
                slot: -1,
                item: Item.emptyItem,
              });
              client.write('set_slot', {
                windowId: 50,
                slot: data.slot,
                item: data.item,
              });
            },
          });
        } else if (data.slot !== -999) {
          // click is in the player inventory not in the GUI
          // We need to cancel the click because the user can't modify to their real inventories while in the GUI
        }
      }
    };
  }
}
