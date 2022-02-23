import { config } from '../..';
import PlayerModule from '../PlayerModule';

const playerModule = new PlayerModule(
  'LunarCooldowns',
  'Add support for Lunar Cooldowns'
);

playerModule.customCode = () => {
  const player = playerModule.player;

  player.listener.on('arrow_slot_empty', () => {
    if (!config.lunarCooldowns) return;
    if (player.isInGameMode('DUELS_BRIDGE_')) {
      player.lcPlayer.addCooldownManual('hypixel_bow', 3500, 261);
    }
  });

  player.listener.on('arrow_slot_filled', () => {
    if (!config.lunarCooldowns) return;
    if (player.isInGameMode('DUELS_BRIDGE_')) {
      player.lcPlayer.removeCooldownManual('hypixel_bow');
    }
  });
};

export default playerModule;
