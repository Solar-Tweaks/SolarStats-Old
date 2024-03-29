import { config } from '../..';
import Item from '../../Classes/Item';
import PlayerModule from '../PlayerModule';

const settingItem = new Item(347);
settingItem.displayName = '§fLunar Cooldowns';
settingItem.lore = [
  '',
  '§7Adds support for Lunar',
  '§7Cooldowns in some modes',
  '',
  `§7Current: §${config.modules.lunarCooldowns ? 'aEnabled' : 'cDisabled'}`,
];

const playerModule = new PlayerModule(
  'LunarCooldowns',
  'Add support for Lunar Cooldowns',
  settingItem,
  'lunarCooldowns'
);

playerModule.customCode = () => {
  const player = playerModule.player;

  player.listener.on('arrow_slot_empty', () => {
    if (!config.modules.lunarCooldowns) return;
    if (player.isInGameMode('DUELS_BRIDGE_')) {
      player.lcPlayer.addCooldown('hypixel_bow', 3500, 261);
    }
  });

  player.listener.on('arrow_slot_filled', () => {
    if (!config.modules.lunarCooldowns) return;
    if (player.isInGameMode('DUELS_BRIDGE_')) {
      player.lcPlayer.removeCooldown('hypixel_bow');
    }
  });
};

export default playerModule;
