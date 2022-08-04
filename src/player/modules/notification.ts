import axios from 'axios';
import { Client, PacketMeta, ServerClient } from 'minecraft-protocol';
import { config } from '../..';
import Item from '../../Classes/Item';
import PlayerModule from '../PlayerModule';

const settingItem = new Item(321);
settingItem.displayName = '§fNotifications';
settingItem.lore = [
  '',
  '§7Send a notification when',
  '§7an event happens in bedwars',
  '',
  `§7Current: §${config.modules.notifications ? 'aEnabled' : 'cDisabled'}`,
];

const playerModule = new PlayerModule(
  'Notifications',
  'Send a notification when an event happens in bedwars',
  settingItem,
  'notifications'
);

const teams = {
  Green: 133,
  Red: 152,
  Blue: 22,
  Yellow: 170,
  Aqua: 168,
  White: 155,
  Pink: 319,
  Gray: 1,
};

const onIncomingPacket = async (
  data,
  meta: PacketMeta,
  toClient: ServerClient,
  toServer: Client
) => {
  if (
    playerModule.player.status?.game?.code !== 'BEDWARS' &&
    playerModule.player.status?.mode !== 'LOBBY'
  )
    return;

  if (meta.name === 'scoreboard_team') {
    if (data.nameTagVisibility !== 'never') return;
    let realTeam = '';
    for (const team of Object.keys(teams))
      if (data.team.startsWith(team)) realTeam = team;
    if (!realTeam) return;

    const target = playerModule.player.teams.find(
      (team) => team.name === data.team
    );
    if (!target) return;

    // if (target.players[0] === playerModule.player.client.username) return;

    playerModule.player.lcPlayer.sendNotification(
      `${target.players[0]} drank an invisibility potion`,
      5000
    );

    playerModule.player.lcPlayer.addCooldown(data.team, 30000, teams[realTeam]);

    const response = await axios
      .get(
        `https://api.mojang.com/users/profiles/minecraft/${target.players[0]}`
      )
      .catch(() => {
        // Ignoring fake players
      });

    if (!response) return;

    const addDashes = (i) =>
      i.substr(0, 8) +
      '-' +
      i.substr(8, 4) +
      '-' +
      i.substr(12, 4) +
      '-' +
      i.substr(16, 4) +
      '-' +
      i.substr(20);
    playerModule.player.lcPlayer.addTeammate({
      uuid: addDashes(response.data.id),
    });
  }
};

playerModule.customCode = () => {
  playerModule.player.proxy.on('incoming', onIncomingPacket);
};

playerModule.onDisconnect = () => {
  playerModule.player.proxy.removeListener('incoming', onIncomingPacket);
};

export default playerModule;
