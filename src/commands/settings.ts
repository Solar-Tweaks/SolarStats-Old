import { config, reloadConfig } from '..';
import Command from '../Classes/Command';
import Inventory from '../Classes/Inventory';
import Item from '../Classes/Item';
import { InventoryType } from '../Types';
import { setValue } from '../utils/config';

const command = new Command(
  'solarstats',
  [
    {
      argument: 'action',
      required: false,
      type: 'string',
    },
  ],
  ['ss', 'solartweaks']
);

command.onTriggered = async (chatCommand, args) => {
  const player = command.player;

  const action = command.getStringArgument(args, 0, true);
  if (action === 'reload') {
    await reloadConfig();
    player.sendMessage('§aSolar Stats config successfully reloaded!');
    return;
  }

  const inventory = new Inventory(
    InventoryType.CONTAINER,
    '§cSettings §8- §cSolar Stats',
    45
  );

  const nametag = new Item(421);
  nametag.displayName = '§fAPI Key';
  nametag.lore = [
    '',
    '§7The API key is used to retrieve',
    '§7data from the Hypixel API',
    '',
    `§7Current: §o${config.apiKey ?? '§rnone'}`,
  ];

  const bedrock = new Item(7);
  bedrock.displayName = '§fHeight Limit Delay Fix';
  bedrock.lore = [
    '',
    '§7Makes the the height limit in',
    '§7bridge more responsive',
    '',
    `§7Current: §${config.heightLimitDelayFix ? 'aEnabled' : 'cDisabled'}`,
  ];

  const map = new Item(395);
  map.displayName = '§fBedwars Waypoints';
  map.lore = [
    '',
    '§7Adds waypoints to each',
    '§7base in Bedwars',
    '',
    `§7Current: §${config.bedwarsWaypoints ? 'aEnabled' : 'cDisabled'}`,
  ];

  const clock = new Item(347);
  clock.displayName = '§fLunar Cooldowns';
  clock.lore = [
    '',
    '§7Adds support for Lunar',
    '§7Cooldowns in some modes',
    '',
    `§7Current: §${config.lunarCooldowns ? 'aEnabled' : 'cDisabled'}`,
  ];

  const bed = new Item(355);
  bed.displayName = '§fBedwars Teammates';
  bed.lore = [
    '',
    '§7Adds support for Lunar',
    '§7TeamView mod in Bedwars',
    '',
    `§7Current: §${config.bedwarsTeammates ? 'aEnabled' : 'cDisabled'}`,
  ];

  const commandBlock = new Item(137);
  commandBlock.displayName = '§fServer actions';
  commandBlock.lore = [
    '',
    '§7Manage Solar Stats',
    '§7proxy server from here',
    '',
    '§7§nActions:',
    '§7§lRight Click §r§7- Stop server',
    '§7§lLeft Click §r§7- Restart server',
  ];

  const barrier = new Item(166);
  barrier.displayName = '§cClose';

  const paper = new Item(339);
  paper.displayName = '§fStatus';
  paper.lore = [
    '',
    `§7Player: §a${player.client.username}`,
    `§7Uptime: ${Math.floor(process.uptime())}s`,
  ];

  inventory.addItems([
    { item: nametag, position: 12 },
    { item: bedrock, position: 14 },
    { item: map, position: 20 },
    { item: clock, position: 22 },
    { item: bed, position: 24 },
    { item: commandBlock, position: 36 },
    { item: barrier, position: 40 },
    { item: paper, position: 44 },
  ]);

  inventory.on('click', async (event) => {
    if (event.button !== 0 || event.mode !== 0) {
      event.cancel(player.client);
      return;
    }

    async function toggleSetting(
      setting: string,
      loreIndex: number,
      item: Item,
      slot: number
    ): Promise<void> {
      event.cancel(player.client);
      await setValue(setting, !config[setting]);
      await reloadConfig();
      item.lore[loreIndex] = `§7Current: §${
        config[setting] ? 'aEnabled' : 'cDisabled'
      }`;
      inventory.setSlot(player.client, item, slot);
    }

    switch (event.slot) {
      case 12:
      case 44:
        // refreshInventory();
        event.cancel(player.client);
        break;
      case 14:
        await toggleSetting('heightLimitDelayFix', 4, bedrock, 14);
        break;
      case 20:
        await toggleSetting('bedwarsWaypoints', 4, map, 20);
        break;
      case 22:
        await toggleSetting('lunarCooldowns', 4, clock, 22);
        break;
      case 24:
        await toggleSetting('bedwarsTeammates', 4, bed, 24);
        break;
      case 40:
        inventory.close(player);
        break;

      default:
        break;
    }
  });

  inventory.display(player);
};

export default command;
