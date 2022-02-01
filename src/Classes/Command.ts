import { CommandSyntax, CommandSyntaxType } from '../Types';
import Player from './Player';

export default class Command {
  public name: string;
  public aliases: string[];
  public syntax: CommandSyntax[];
  public player: Player;

  public constructor(
    name: string,
    syntax: CommandSyntax[],
    aliases: string[] = []
  ) {
    this.name = name;
    this.aliases = aliases;
    this.syntax = syntax;
  }

  public setPlayer(player: Player): Command {
    this.player = player;
    return this;
  }

  public onTriggered(command: string, args: string[]): void {
    console.warn(`Command ${command} not handled!`);
  }

  public validateSyntax(command: string, args: string[]): boolean {
    const requiredArgsCount = this.syntax.filter(
      (syntax) => syntax.required
    ).length;
    const optionalArgsCount = args.length - requiredArgsCount;

    if (requiredArgsCount > args.length) return false;

    for (let i = 0; i < requiredArgsCount; i++) {
      const syntax = this.syntax[i];
      if (!this.validateType(args[i], syntax.type)) return false;
    }

    for (let i = 0; i < optionalArgsCount; i++) {
      const syntax = this.syntax[requiredArgsCount + i];

      if (!this.validateType(args[requiredArgsCount + i], syntax.type))
        return false;
    }

    return true;
  }

  public getSyntaxMessage(): string {
    const args: string[] = [];
    this.syntax.forEach((syntax) => {
      if (syntax.required) args.push(`<${syntax.argument}>`);
      else args.push(`[${syntax.argument}]`);
    });
    return `§cSyntax: /${this.name} ${args.join(' ')}`;
  }

  public getStringArgument(
    args: string[],
    index: number,
    optional?: boolean
  ): string {
    if (optional) if (!args[index]) return '';
    return args[index];
  }

  public getNumberArgument(
    args: string[],
    index: number,
    optional?: boolean
  ): number {
    if (optional) if (!args[index]) return 1;
    return parseInt(args[index]);
  }

  public getJsonArgument(
    args: string[],
    index: number,
    optional?: boolean
  ): unknown {
    if (optional) if (!args[index]) return {};
    return JSON.parse(args[index]);
  }

  public getArrayArgument(
    args: string[],
    index: number,
    optional?: boolean
  ): unknown[] {
    if (optional) if (!args[index]) return [];
    return JSON.parse(args[index]);
  }

  private validateType(argument: string, type: CommandSyntaxType): boolean {
    switch (type) {
      case 'number':
        if (isNaN(Number(argument))) return false;
        break;
      case 'json':
        try {
          JSON.parse(argument);
        } catch (e) {
          return false;
        }
        break;
      case 'array':
        try {
          if (!Array.isArray(JSON.parse(argument))) return false;
        } catch (e) {
          return false;
        }
      default:
        break;
    }
    return true;
  }
}
