import { config } from '../..';
import WaypointsMappings from '../../utils/WaypointsMappings';
import PlayerModule from '../PlayerModule';

const playerModule = new PlayerModule(
  'BedwarsWaypoints',
  'Add waypoints for each base in bedwars'
);

playerModule.onLocationUpdate = () => {
  if (!config.bedwarsWaypoints) return;
  const player = playerModule.player;
  if (player.status.game.code === 'BEDWARS' && player.status.map) {
    const map = player.status.map;
    const mapError = () => {
      player.lcPlayer.sendNotification(
        `Couldn't find waypoints for ${map}`,
        2500,
        'error'
      );
    };
    if (Object.prototype.hasOwnProperty.call(WaypointsMappings, map)) {
      const mapMappings = WaypointsMappings[map].find((mapping) =>
        mapping.modes.includes(player.status.mode)
      );
      if (mapMappings)
        mapMappings.waypoints.forEach((waypoint) => {
          player.lcPlayer.addWaypoint(waypoint);
        });
      else mapError();
    } else mapError();
  }
};

export default playerModule;
