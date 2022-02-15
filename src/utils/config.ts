import { validate } from 'jsonschema';
import { Config } from '../Types';
import { existsSync, writeFileSync, readFileSync } from 'fs';

export default function getConfig(): Config {
  // Everything is synchronous because it's easier
  // It doesn't really matter since it's done only once at startup

  const filePath = './config.json';

  const exists = existsSync(filePath);

  if (!exists) {
    console.log(
      'Config does not exists! Creating a new one with default values...'
    );
    writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2));
  }

  const data = readFileSync(filePath, 'utf8');

  try {
    const parsed = JSON.parse(data);
    if (validate(parsed, configSchema).valid) {
      return parsed;
    } else {
      throw new Error("Can't validate config file");
    }
  } catch (error) {
    console.error('Error while processing config file');
    throw error;
  }
}

// Automatically generated schema by `typescript-json-schema`
// Use `npm run generateConfigSchema` to regenerate
export const configSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  properties: {
    apiKey: {
      type: 'string',
    },
    bedwarsTeammates: {
      type: 'boolean',
    },
    bedwarsWaypoints: {
      type: 'boolean',
    },
    heightLimitDelayFix: {
      type: 'boolean',
    },
    lunarCooldowns: {
      type: 'boolean',
    },
    server: {
      properties: {
        host: {
          type: 'string',
        },
        port: {
          type: 'number',
        },
      },
      type: 'object',
    },
  },
  type: 'object',
};

export const defaultConfig: Config = {
  apiKey: "I can't provide a key, sorry!",
  bedwarsWaypoints: true,
  heightLimitDelayFix: true,
  lunarCooldowns: true,
  bedwarsTeammates: true,
  server: {
    host: 'hypixel.net',
    port: 25565,
  },
};
