import { Waypoint } from '@solar-tweaks/minecraft-protocol-lunarclient';
import { Player as HypixelPlayer } from 'hypixel-api-reborn';
import { Client, ServerClient } from 'minecraft-protocol';

export interface Config {
  apiKey: string;
  heightLimitDelayFix: boolean;
  bedwarsWaypoints: boolean;
  lunarCooldowns: boolean;
  bedwarsTeammates: boolean;
  server: {
    host: string;
    port: number;
  };
}

export interface PlayerData {
  player: string;
  name: string;
  formattedNickname: string;
  stats: typeof HypixelPlayer.prototype.stats;
  online: boolean;
  status?: string;
}

export type Mode =
  | 'DUELS_BRIDGE_DUEL'
  | 'DUELS_BRIDGE_DOUBLES'
  | 'DUELS_BRIDGE_THREES'
  | 'DUELS_BRIDGE_FOUR'
  | 'DUELS_BRIDGE_2V2V2V2'
  | 'DUELS_BRIDGE_3V3V3V3'
  | 'DUELS_CAPTURE_THREES'
  | 'DUELS_UHC_DUEL'
  | 'DUELS_UHC_DOUBLES'
  | 'DUELS_UHC_FOUR'
  | 'DUELS_UHC_MEETUP'
  | 'DUELS_SUMO_DUEL';

export interface PlayerInfo {
  UUID: string;
  entityID: number;
}

export interface ListenerEvents {
  switch_server: (toServer: Client) => void;
  server_full: (playerCount: number) => void;
  place_block: (
    packet: BlockPlacePacket,
    toClient: ServerClient,
    toServer: Client
  ) => void;
  arrow_slot_empty: () => void;
  arrow_slot_filled: () => void;
  team_create: (name: string) => void;
  team_delete: (name: string) => void;
  team_edit: (data: unknown) => void;
  team_player_add: (name: string, players: string[]) => void;
}

export interface BlockPlacePacket {
  location: {
    x: number;
    y: number;
    z: number;
  };
  direction: number;
  heldItem: {
    blockId: number;
    itemCount: number;
    itemDamage: number;
    nbtData: unknown;
  };
  cursorX: number;
  cursorY: number;
  cursorZ: number;
}

export type Command =
  | '/d'
  | '/dodge'
  | '/requeue'
  | '/rq'
  | '/req'
  | '/stat'
  | '/stats'
  | '/st'
  | '/spawnfakeplayer'
  | '/sfp'
  | '/dumppackets'
  | '/dp';

export type CommandSyntaxType = 'string' | 'number' | 'json' | 'array';

export interface CommandSyntax {
  argument: string;
  type: CommandSyntaxType;
  required: boolean;
}

export interface ChatMessage {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
  font?: 'minecraft:uniform' | 'minecraft:alt' | 'minecraft:default';
  color?: string;
  insertion?: string;
  clickEvent?: {
    action:
      | 'open_url'
      | 'run_command'
      | 'suggest_command'
      | 'change_page'
      | 'copy_to_clipboard';
    value: string;
  };
  hoverEvent?: {
    action: 'show_text' | 'show_item' | 'show_entity';
    value: {
      text: string;
      extra?: ChatMessage[];
    };
  };
  extra?: ChatMessage[];
}

export interface WaypointsMappings {
  [key: string]: {
    modes: string[];
    waypoints: Waypoint[];
  }[];
}

export enum InventoryType {
  ANVIL = 'minecraft:anvil',
  BEACON = 'minecraft:beacon',
  BREWING = 'minecraft:brewing_stand',
  CHEST = 'minecraft:chest',
  CONTAINER = 'minecraft:container',
  CRAFTING = 'minecraft:crafting_table',
  DISPENSER = 'minecraft:dispenser',
  DROPPER = 'minecraft:dropper',
  ENCHANTING_TABLE = 'minecraft:enchanting_table',
  FURNACE = 'minecraft:furnace',
  HOPPER = 'minecraft:hopper',
  VILLAGER = 'minecraft:villager',
}

export interface InventoryEvents {
  close: () => void;
  click: (
    slot: number,
    button: number,
    packet: unknown,
    toServer: Client
  ) => void;
}

export interface Slot {
  blockId: number;
  itemCount: number;
  itemDamage?: number;
  nbtData?: {
    type: 'compound';
    name: '';
    value: {
      display?: {
        type: 'compound';
        value: {
          Lore?: {
            type: 'list';
            value: {
              type: 'string';
              value: string[];
            };
          };
          Name?: {
            type: 'string';
            value: string;
          };
        };
      };
    };
  };
}

export interface Team {
  name: string;
  players: string[];
}
