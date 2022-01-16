import { Player as HypixelPlayer } from 'hypixel-api-reborn';
import { Client, ServerClient } from 'minecraft-protocol';

export interface Config {
  api_key: string;
  dodge: {
    enabled: boolean;
    nicked: boolean;
    winStreak: number;
    bestWinStreak: number;
    sendStats: boolean;
  };
  heightLimitDelayFix: boolean;
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
  name: string;
  gamemode: number;
  ping: number;
  displayName?: string;
}

export interface ListenerEvents {
  switch_server: (toServer: Client) => void;
  server_full: (playerCount: number) => void;
  player_join: (player: PlayerInfo) => void;
  player_leave: (uuid: string) => void;
  place_block: (
    packet: BlockPlacePacket,
    toClient: ServerClient,
    toServer: Client
  ) => void;
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
  | '/reqeue'
  | '/rq'
  | '/req'
  | '/stat'
  | '/stats'
  | '/st';

export function isCommand(command: string): command is Command {
  return (
    command === '/d' ||
    command === '/dodge' ||
    command === '/reqeue' ||
    command === '/rq' ||
    command === '/req' ||
    command === '/stat' ||
    command === '/stats' ||
    command === '/st'
  );
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
