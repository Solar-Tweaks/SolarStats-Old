import { Mode, PlayerData } from "../Types";

export default function (
  playerData: PlayerData,
  mode: Mode
): { string: string; stats: { [key: string]: unknown } } {
  let string = `${playerData.formattedNickname} §7- `;
  let stats = null;

  switch (mode) {
    case "DUELS_BRIDGE_DUEL":
      stats = playerData.stats.duels.bridge["1v1"];
      string += `§eWS §6§l${stats.winstreak} §r§e| BWS §6§l${stats.bestWinstreak} §r§e| WLR §6§l${stats.WLRatio} §r§e| KDR §6§l${stats.KDRatio}`;
      break;
    case "DUELS_BRIDGE_DOUBLES":
      stats = playerData.stats.duels.bridge["2v2"];
      string += `§eWS §6§l${stats.winstreak} §r§e| BWS §6§l${stats.bestWinstreak} §r§e| WLR §6§l${stats.WLRatio} §r§e| KDR §6§l${stats.KDRatio}`;
      break;
    case "DUELS_BRIDGE_THREES":
      stats = playerData.stats.duels.bridge.overall;
      string += `§eWS §6§l${stats.winstreak} §r§e| BWS §6§l${stats.bestWinstreak} §r§e| WLR §6§l${stats.WLRatio} §r§e| KDR §6§l${stats.KDRatio}`;
      break;
    case "DUELS_BRIDGE_FOUR":
      stats = playerData.stats.duels.bridge["4v4"];
      string += `§eWS §6§l${stats.winstreak} §r§e| BWS §6§l${stats.bestWinstreak} §r§e| WLR §6§l${stats.WLRatio} §r§e| KDR §6§l${stats.KDRatio}`;
      break;
    case "DUELS_BRIDGE_2V2V2V2":
      stats = playerData.stats.duels.bridge.overall;
      string += `§eWS §6§l${stats.winstreak} §r§e| BWS §6§l${stats.bestWinstreak} §r§e| WLR §6§l${stats.WLRatio} §r§e| KDR §6§l${stats.KDRatio}`;
      break;
    case "DUELS_BRIDGE_3V3V3V3":
      stats = playerData.stats.duels.bridge.overall;
      string += `§eWS §6§l${stats.winstreak} §r§e| BWS §6§l${stats.bestWinstreak} §r§e| WLR §6§l${stats.WLRatio} §r§e| KDR §6§l${stats.KDRatio}`;
      break;
    case "DUELS_CAPTURE_THREES":
      stats = playerData.stats.duels.bridge.overall;
      string += `§eWS §6§l${stats.winstreak} §r§e| BWS §6§l${stats.bestWinstreak} §r§e| WLR §6§l${stats.WLRatio} §r§e| KDR §6§l${stats.KDRatio}`;
      break;
    case "DUELS_UHC_DUEL":
      stats = playerData.stats.duels.uhc["1v1"];
      string += `§eWS §6§l${stats.winstreak} §r§e| BWS §6§l${stats.bestWinstreak} §r§e| WLR §6§l${stats.WLRatio} §r§e| KDR §6§l${stats.KDRatio}`;
      break;
    case "DUELS_UHC_DOUBLES":
      stats = playerData.stats.duels.uhc["2v2"];
      string += `§eWS §6§l${stats.winstreak} §r§e| BWS §6§l${stats.bestWinstreak} §r§e| WLR §6§l${stats.WLRatio} §r§e| KDR §6§l${stats.KDRatio}`;
      break;
    case "DUELS_UHC_FOUR":
      stats = playerData.stats.duels.uhc["4v4"];
      string += `§eWS §6§l${stats.winstreak} §r§e| BWS §6§l${stats.bestWinstreak} §r§e| WLR §6§l${stats.WLRatio} §r§e| KDR §6§l${stats.KDRatio}`;
      break;
    case "DUELS_UHC_MEETUP":
      stats = playerData.stats.duels.uhc.meetup;
      string += `§eWS §6§l${stats.winstreak} §r§e| BWS §6§l${stats.bestWinstreak} §r§e| WLR §6§l${stats.WLRatio} §r§e| KDR §6§l${stats.KDRatio}`;
      break;
    case "DUELS_SUMO_DUEL":
      stats = playerData.stats.duels.sumo;
      string += `§eWS §6§l${stats.winstreak} §r§e| BWS §6§l${stats.bestWinstreak} §r§e| WLR §6§l${stats.WLRatio} §r§e| KDR §6§l${stats.KDRatio}`;
      break;
    default:
      string += "§cUnknown game mode";
      break;
  }

  return { string, stats };
}
