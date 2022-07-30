import { mkdir, readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import Command from '../Classes/Command';
import Inventory from '../Classes/Inventory';
import Item from '../Classes/Item';
import Logger from '../Classes/Logger';
import Player from '../player/Player';
import PlayerModule from '../player/PlayerModule';
import { readConfig, readConfigSync } from './config';

export default async function loadPlugins(player: Player): Promise<void> {
  const folder = 'plugins';
  await stat(folder).catch(async () => await mkdir(folder));

  const files = await readdir(folder);

  for (const file of files) {
    if (!file.endsWith('.js')) continue;

    try {
      const loadedPlugin = await loadPlugin(
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
  let info: PluginInfo;

  const context = createContext({
    console: console,
    __dirname: __dirname,
    __cwd: process.cwd(),
    __plugins: join(process.cwd(), 'plugins'),
    toolbox: {
      Logger,
      Command,
      PlayerModule,
      Inventory,
      Item,
      getConfig: readConfig,
      getConfigSync: readConfigSync,
    },
    player,
    registerPlugin: (plugin: PluginInfo): void => {
      info = plugin;
    },
    registerCommand: (command: Command): void => {
      player.commandHandler.registerCommand(command.setPlayer(player));
    },
    registerPlayerModule: (playerModule: PlayerModule): void => {
      player.modules.push(playerModule.setPlayer(player));
    },
    requireModule: (module: string): any => {
      try {
        return require(module);
      } catch (error) {
        return null;
      }
    },
  });

  try {
    runInContext(plugin, context, {
      filename: file,
    });
  } catch (error) {
    return void Logger.error(
      `An error occured while loading plugin ${file}!`,
      error
    );
  }

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
