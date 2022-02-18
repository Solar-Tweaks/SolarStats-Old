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

  public constructor(string: string, description: string) {
    this.name = string;
    this.description = description;

    this.handler = () => {};
    this.customCode = () => {};
    this.onLocationUpdate = () => {};
  }

  public setPlayer(player: Player): PlayerModule {
    this.player = player;
    return this;
  }
}
