import { InstantConnectProxy } from "prismarine-proxy";
import { isCommand } from "../Types";
import Command from "./Command";

export default class CommandHandler {
  public commands: Command[];

  public constructor(proxy: InstantConnectProxy) {
    this.commands = [];

    proxy.on("outgoing", (data, meta, toClient, toServer) => {
      if (meta.name === "chat") {
        const message = data.message.toLowerCase().split(" ")[0];
        if (!isCommand(message)) {
          toServer.write(meta.name, data);
          return;
        }

        const command = this.commands.find(
          (command) =>
            command.name === message.replace("/", "") ||
            command.aliases.includes(message.replace("/", ""))
        );

        if (command) command.onTriggered(data.message);
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
