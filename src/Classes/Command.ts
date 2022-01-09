import Player from './Player';

export default class Command {
  public name: string;
  public aliases: string[];
  public player: Player;

  public constructor(name: string, aliases: string[] = []) {
    this.name = name;
    this.aliases = aliases;
  }

  public setPlayer(player: Player): Command {
    this.player = player;
    return this;
  }

  public onTriggered(command: string): void {
    console.warn(`Command ${command} not handled!`);
  }
}
