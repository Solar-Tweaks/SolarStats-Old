import { mkdir, readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import Command from '../Classes/Command';
import Item from '../Classes/Item';
import Logger from '../Classes/Logger';
import Player from '../player/Player';
import PlayerModule from '../player/PlayerModule';
import { readConfig } from './config';

export default async function loadPlugins(player: Player): Promise<void> {
  const folder = 'plugins';
  await stat(folder).catch(async () => await mkdir(folder));

  const files = await readdir(folder);

  for (const file of files) {
    if (!file.endsWith('.js')) continue;

    try {
      const loadedPlugin = loadPlugin(
        player,
        await readFile(join(folder, file), 'utf8'),
        file
      );
      if (loadedPlugin) {
        player.plugins.push(loadedPlugin);
      }
    } catch (error) {
      Logger.error(`Error while loading plugin ${file}`, error);
    }
  }
}

export function loadPlugin(
  player: Player,
  plugin: string,
  file: string
): PluginInfo {
  const toolbox = {
    Logger,
    Command,
    PlayerModule,
    Item,
    getConfig: readConfig,
  };

  let info: PluginInfo;

  function registerPlugin(plugin: PluginInfo): void {
    info = plugin;
  }

  function registerCommand(command: Command): void {
    player.commandHandler.registerCommand(command.setPlayer(player));
  }

  function registerPlayerModule(playerModule: PlayerModule): void {
    player.modules.push(playerModule.setPlayer(player));
  }

  eval(plugin);

  if (isPluginInfo(info)) return info;
  else
    Logger.error(
      `Plugin ${file} is not a valid plugin. It doesn't export a valid plugin info. This plugin may work but make sure to call the \`registerPlugin\` function to register the plugin!`
    );
}

export type PluginInfo = {
  name: string;
  description: string;
  version?: string;
  author?: string;
};

export function isPluginInfo(plugin: any): plugin is PluginInfo {
  return (
    typeof plugin === 'object' &&
    typeof plugin.name === 'string' &&
    typeof plugin.description === 'string'
  );
}
