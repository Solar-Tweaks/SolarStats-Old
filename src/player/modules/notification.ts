import { Client, PacketMeta, ServerClient } from 'minecraft-protocol';
import { config } from '../..';
import Item from '../../Classes/Item';
import PlayerModule from '../PlayerModule';

const settingItem = new Item(321);
settingItem.displayName = '§6Notifications';
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

const teams = [
  'Green',
  'Red',
  'Blue',
  'Yellow',
  'Aqua',
  'White',
  'Pink',
  'Gray',
];

const onIncomingPacket = (
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
    let validTeam = false;
    for (const team of teams) if (data.team.startsWith(team)) validTeam = true;
    if (!validTeam) return;

    playerModule.player.lcPlayer.sendNotification(
      `${data.name} drink an invisibilty potion`,
      5000
    );
  }
};

playerModule.customCode = () => {
  playerModule.player.proxy.on('incoming', onIncomingPacket);
};

playerModule.onDisconnect = () => {
  playerModule.player.proxy.removeListener('incoming', onIncomingPacket);
};

export default playerModule;
