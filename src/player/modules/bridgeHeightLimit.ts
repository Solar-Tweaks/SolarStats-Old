import { Client, ServerClient } from 'minecraft-protocol';
import { config } from '../..';
import { BlockPlacePacket } from '../../Types';
import PlayerModule from '../PlayerModule';

const playerModule = new PlayerModule(
  'BridgeHeightLimit',
  'Make block removal faster when reaching height limit in bridge'
);

playerModule.event = 'place_block';

playerModule.handler = (
  packet: BlockPlacePacket,
  toClient: ServerClient,
  toServer: Client
) => {
  if (playerModule.player.status && config.heightLimitDelayFix) {
    if (
      playerModule.player.status.mode.includes('DUELS_BRIDGE_') &&
      ((packet.location.y === 99 && packet.direction === 1) ||
        packet.location.y > 99) &&
      packet.heldItem.blockId === 159
    ) {
      const realBlockLocation = {
        x: packet.location.x,
        y: packet.location.y,
        z: packet.location.z,
      };
      switch (packet.direction) {
        case 0:
          realBlockLocation.x = packet.location.x - 1;
          break;
        case 1:
          realBlockLocation.y = packet.location.y + 1;
          break;
        case 2:
          realBlockLocation.z = packet.location.z - 1;
          break;
        case 3:
          realBlockLocation.z = packet.location.z + 1;
          break;
        case 4:
          realBlockLocation.x = packet.location.x - 1;
          break;
        case 5:
          realBlockLocation.x = packet.location.x + 1;
          break;
        default:
          break;
      }
      toClient.write('block_change', {
        location: realBlockLocation,
        type: 0,
      });
      return;
    }
  }
  toServer.write('block_place', packet);
};

export default playerModule;
