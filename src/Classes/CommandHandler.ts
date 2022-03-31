import { InstantConnectProxy } from 'prismarine-proxy';
import Command from './Command';
import Logger from './Logger';

export default class CommandHandler {
  public commands: Command[];
  public commandsList: string[];

  public constructor(proxy: InstantConnectProxy) {
    this.commands = [];
    this.commandsList = [];

    proxy.on('outgoing', (data, meta, toClient, toServer) => {
      if (meta.name === 'chat') {
        const message: string = data.message.toLowerCase().split(' ')[0];
        if (!this.commandsList.includes(message)) {
          toServer.write(meta.name, data);
          return;
        }

        const commandS = message.replace('/', '');
        const command = this.commands.find(
          (command) =>
            command.name === commandS || command.aliases.includes(commandS)
        );

        const args: string[] = (data.message as string).split(' ');
        args.shift();
        if (!command.validateSyntax(message, args)) {
          command.player.sendMessage(command.getSyntaxMessage());
          return;
        }

        if (command) command.onTriggered(message, args);
        else Logger.warn(`Command ${message} not found`);
      }
    });
  }

  public registerCommand(command: Command | Command[]): void {
    if (!Array.isArray(command)) {
      this.commands.push(command);
      this.commandsList.push(`/${command.name}`);
      this.commandsList.push(...command.aliases);
    } else {
      this.commands = this.commands.concat(command);
      this.commandsList = this.commandsList.concat(
        command.map((c) => `/${c.name}`)
      );
      command.forEach((command) => {
        command.aliases.forEach((c) => this.commandsList.push(`/${c}`));
      });
    }
  }

  public removeCommand(command: Command): void {
    this.commands = this.commands.filter((c) => c !== command);
  }
}
