import { InstantConnectProxy } from 'prismarine-proxy';
import { isCommand } from '../Types';
import Command from './Command';

export default class CommandHandler {
  public commands: Command[];

  public constructor(proxy: InstantConnectProxy) {
    this.commands = [];

    proxy.on('outgoing', (data, meta, toClient, toServer) => {
      if (meta.name === 'chat') {
        const message = data.message.toLowerCase().split(' ')[0];
        if (!isCommand(message)) {
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
        else console.log(`Command ${message} not found`);
      }
    });
  }

  public registerCommand(command: Command | Command[]): void {
    if (!Array.isArray(command)) {
      this.commands.push(command);
    } else {
      this.commands = this.commands.concat(command);
    }
  }

  public removeCommand(command: Command): void {
    this.commands = this.commands.filter((c) => c !== command);
  }
}
