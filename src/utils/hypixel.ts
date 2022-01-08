import { Color, Player, Status } from 'hypixel-api-reborn';
import { hypixelClient } from '..';
import { PlayerData } from '../Types';

export async function fetchPlayerData(
  playerOrUuid: string
): Promise<PlayerData> {
  const playerData: PlayerData = {
    player: playerOrUuid,
    name: null,
    formattedNickname: null,
    stats: null,
    online: false,
  };

  const player = hypixelClient.getPlayer(playerOrUuid);
  const status = hypixelClient.getStatus(playerOrUuid);

  return new Promise<PlayerData>((resolve) => {
    Promise.all([player, status])
      .then(([player, status]) => {
        playerData.name = player.nickname;
        playerData.stats = player.stats;
        playerData.formattedNickname = transformNickname(player);

        if (player.isOnline) {
          playerData.online = true;

          playerData.status = status.mode;
        }

        resolve(playerData);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

export async function fetchPlayerLocation(uuid: string): Promise<Status> {
  return new Promise<Status>((resolve, reject) => {
    hypixelClient
      .getStatus(uuid, { noCacheCheck: true, noCaching: true })
      .then((status) => {
        resolve(status);
      })
      .catch((reason) => {
        reject(reason);
      });
  });
}

export function transformNickname(player: Player): string {
  let nickname = '';
  switch (player.rank) {
    case 'Admin':
      nickname = `§cAdmin ${player.nickname}`;
      break;
    case 'Game Master':
      nickname = `§2[GM] ${player.nickname}`;
      break;
    case 'VIP':
      nickname = `§a[VIP] ${player.nickname}`;
      break;
    case 'VIP+':
      nickname = `§a[VIP§6+§a] ${player.nickname}`;
      break;
    case 'MVP':
      nickname = `§b[MVP] ${player.nickname}`;
      break;
    case 'MVP+':
      nickname = `§b[MVP${transormColor(player.plusColor)}+§b] ${
        player.nickname
      }`;
      break;
    case 'MVP++':
      nickname = `§6[MVP${transormColor(player.plusColor)}++§6] ${
        player.nickname
      }`;
      break;
    case 'YouTube':
      nickname = `§a[§7YT] ${player.nickname}`;
      break;
    case 'MOJANG':
      nickname = `§6[MOJANG] ${player.nickname}`;
      break;
    case 'PIG+++':
      nickname = `§d[PIG§b+++§d] ${player.nickname}`;
    default:
      nickname = `§7${player.nickname}`;
      break;
  }
  return (nickname += '§r');
}

/**
 * Thanks hypixel-api for not providing this one
 */
export function transormColor(color: Color): string {
  let transformed = '§';

  let colorCode = '';

  try {
    colorCode = color.toCode();
  } catch {
    colorCode = 'GRAY';
  }

  switch (colorCode) {
    case 'BLACK':
      transformed += '0';
      break;
    case 'DARK_BLUE':
      transformed += '1';
      break;
    case 'DARK_GREEN':
      transformed += '2';
      break;
    case 'DARK_AQUA':
      transformed += '3';
      break;
    case 'DARK_RED':
      transformed += '4';
      break;
    case 'DARK_PURPLE':
      transformed += '5';
      break;
    case 'GOLD':
      transformed += '6';
      break;
    case 'GRAY':
      transformed += '7';
      break;
    case 'DARK_GRAY':
      transformed += '8';
      break;
    case 'BLUE':
      transformed += '9';
      break;
    case 'GREEN':
      transformed += 'a';
      break;
    case 'AQUA':
      transformed += 'b';
      break;
    case 'RED':
      transformed += 'c';
      break;
    case 'LIGHT_PURPLE':
      transformed += 'd';
      break;
    case 'YELLOW':
      transformed += 'e';
      break;
    case 'WHITE':
      transformed += 'f';
      break;
    default:
      transformed += 'f';
      break;
  }

  return transformed;
}
