import Item from '../Classes/Item';
import { ListenerEvents } from '../Types';
import Player from './Player';
import { Status } from 'hypixel-api-reborn';

enum Events {
  CustomCode = 'customCode',
  ConfigChange = 'onConfigChange',
  LocationUpdate = 'onLocationUpdate',
  Disconnect = 'onDisconnect',
}

export default class PlayerModule {
  public readonly name: string;
  public readonly description: string;
  public event: keyof ListenerEvents;
  public player: Player;

  public handler: Function;
  public customCode: () => void;
  public onConfigChange: (enabled: boolean) => void;
  public onLocationUpdate: (status: Status) => void;
  public onDisconnect: () => void;

  public settingItem: Item;
  public configKey: string;

  public constructor(
    name: string,
    description: string,
    settingItem: Item,
    configKey: string
  ) {
    this.name = name;
    this.description = description;

    this.handler = () => {};
    this.customCode = () => {};
    this.onConfigChange = () => {};
    this.onLocationUpdate = () => {};
    this.onDisconnect = () => {};

    this.settingItem = settingItem;
    this.configKey = configKey;
  }

  public setPlayer(player: Player): PlayerModule {
    this.player = player;
    return this;
  }

  public handle(type: keyof typeof Events, func: (...args: any) => void): () => void {
    this[Events[type]] = func;
    return func;
  }
}
