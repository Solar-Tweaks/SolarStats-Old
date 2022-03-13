import { readFile } from 'fs/promises';
import { config } from '..';
import Command from '../Classes/Command';

const command = new Command('sdebug', []);

command.onTriggered = async (chatCommand, args) => {
  const version: string = JSON.parse(
    await readFile('package.json', 'utf8')
  ).version;
  const infos = [
    `§aVersion: §r${version}`,
    `§aUUID: §r${command.player.uuid}`,
    `§aUsername: §r${command.player.client.username}`,
    `§aServer: §r${config.server.host}:${config.server.port}`,
    `§aAPI Key: §r${config.apiKey}`,
    `§aDevelopment build: §r${version.endsWith('-dev') ? 'Yes' : 'No'}`,
    `§aGame Mode: §r${command.player.status?.mode ?? 'Unknown'}`,
    `§aLast Game Mode: §r${command.player.lastGameMode ?? 'Unknown'}`,
    `§aUptime: §r${Math.floor(process.uptime() / 60)} minutes`,
    `§aProxy Memory Usage: §r${Math.round(
      process.memoryUsage().heapUsed / 1024 / 1024
    )} MB`,
    `§aProxy CPU Usage: §r${process.cpuUsage().system / 1000 / 1000}%`,
    `§aModule (${command.player.modules.length}): §r${command.player.modules
      .map((m) => m.name)
      .join(', ')}`,
    `§aCrashed modules (${command.player.crashedModules.length}): ${
      command.player.crashedModules.length === 0
        ? '§rNone'
        : '§c' + command.player.crashedModules.map((m) => m.name).join(', ')
    }`,
  ];
  command.player.sendMessage(
    `\n§cSolar Stats - Debug info:\n\n${infos.join('\n')}`
  );
};

export default command;
