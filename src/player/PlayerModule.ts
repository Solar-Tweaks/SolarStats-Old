import Item from '../Classes/Item';
import { ListenerEvents } from '../Types';
import Player from './Player';

export default class PlayerModule {
  public readonly name: string;
  public readonly description: string;
  public event: keyof ListenerEvents;
  public player: Player;

  public handler: Function;
  public customCode: () => void;
  public onLocationUpdate: () => void;
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
    this.onLocationUpdate = () => {};
    this.onDisconnect = () => {};

    this.settingItem = settingItem;
    this.configKey = configKey;
  }

  public setPlayer(player: Player): PlayerModule {
    this.player = player;
    return this;
  }
}
