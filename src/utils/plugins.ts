import { mkdir, readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import Command from '../Classes/Command';
import Inventory from '../Classes/Inventory';
import { InventoryType } from '../Types';
import Item from '../Classes/Item';
import Logger from '../Classes/Logger';
import Player from '../player/Player';
import PlayerModule from '../player/PlayerModule';
import { readConfig, readConfigSync } from './config';
import { StringComponentBuilder } from '@minecraft-js/chat';
import { parse as parseNBT } from 'prismarine-nbt';
import fetch from 'node-fetch';
import axios from 'axios';

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
  let info: PluginInfo;

  const context = createContext({
    ...global,
    dirFetch: fetch,
    fetch: async (url: string, options: object): Promise<string | object> => {
      let returnData: any = await fetch(url, options);
      returnData = await returnData.text();

      try {
        returnData = JSON.parse(returnData);
      } catch {}

      return returnData;
    },
    axios,
    console,
    Logger: new Logger(file.substring(0, file.length - 3)),
    Buffer,
    __dirname,
    __cwd: process.cwd(),
    __plugins: join(process.cwd(), 'plugins'),
    toolbox: {
      Command,
      PlayerModule,
      Inventory,
      InventoryType,
      Item,
      Message: StringComponentBuilder,
      getConfig: readConfig,
      getConfigSync: readConfigSync,
      parseNBTData: (
        data: Buffer | string,
        nbtType?: 'big' | 'little' | 'littleVarint'
      ): Promise<{
        parsed: {
          type: 'compound';
          value: any;
        } & {
          name: string;
        };
        type: 'big' | 'little' | 'littleVarint';
        metadata: {
          // The decompressed buffer
          buffer: Buffer;
          // The length of bytes read from the buffer
          size: number;
        };
      }> => {
        if (!Buffer.isBuffer(data)) {
          data = Buffer.from(data, 'base64');
        }
        return parseNBT(data, nbtType);
      },
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
        if (
          module.startsWith('.') &&
          (module.charAt(1) == '/' ||
            (module.charAt(1) == '.' && module.charAt(2) == '/'))
        ) {
          module = join(process.cwd(), 'plugins', module);
        }
        return require(module);
      } catch (error) {
        // Checks if the error was because the module doesn't exist, in which case it'll return null
        // but if the error was something else it will throw it.
        if (error.code != 'MODULE_NOT_FOUND') {
          throw error;
        }
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
  version?: `${number}.${number}.${number}`;
  author?: string;
};

export function isPluginInfo(plugin: any): plugin is PluginInfo {
  return (
    typeof plugin === 'object' &&
    typeof plugin.name === 'string' &&
    typeof plugin.description === 'string'
  );
}
