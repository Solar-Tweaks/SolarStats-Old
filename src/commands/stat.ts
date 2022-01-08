import Command from '../Classes/Command';
import Player from '../Classes/Player';
import { Mode } from '../Types';
import formatStats from '../utils/formatStats';
import { fetchPlayerData } from '../utils/hypixel';

const stat = new Command('stat', ['stats', 'st']);

stat.onTriggered = async (command: string): Promise<void> => {
  const args = command.split(' ');
  const slashCommand = args.shift();
   /* const playerName = args[0];  Unused for now */

  let formattedStats = '';

  switch (args.length) {
    case 0:
      if (!playedSinceConnection(stat.player)) {
        stat.player.sendMessage('§cYou have not played since you connected.');
        return;
      }

      const stats = await fetchPlayerData(stat.player.client.username);
      if (stats)
        formattedStats = formatStats(
          stats,
          stat.player.lastGameMode as Mode
        ).string;
      break;
    case 1:
      // Fetch given player stats in latest gamemode played
      break;
    case 2:
      // Fetch given player stats in given gamemode
      break;
    default:
      stat.player.sendMessage(
        `§cUsage: ${slashCommand} [player] [gamemode]\n\n§7§o${slashCommand} §r§8- §r§cDisplays your stats in the latest played gamemode.\n§7§o${slashCommand} [player] §r§8- §r§cDisplays the stats of the given player in the latest played gamemode.\n§7§o${slashCommand} [player] [gamemode] §r§8- §r§cDisplays the stats of the given player in the given gamemode.`
      );
      return;
  }

  stat.player.sendMessage(formattedStats);
};

function playedSinceConnection(player: Player): boolean {
  return player.lastGameMode ? true : false;
}

export default stat;
