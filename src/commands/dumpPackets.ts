import { PacketMeta } from 'minecraft-protocol';
import Command from '../Classes/Command';
import * as fs from 'fs/promises';

const command = new Command(
  'dumppackets',
  [
    {
      argument: 'time ms',
      required: true,
      type: 'number',
    },
    {
      argument: 'ignored packets',
      required: false,
      type: 'array',
    },
  ],
  ['dp']
);

command.onTriggered = (chatCommand, args) => {
  const packets: { name: string; timestamp: string; packet: unknown }[] = [];
  const ignoredPackets: string[] = command.getArrayArgument(
    args,
    1,
    true
  ) as string[];

  const callback = (data: unknown, packetMeta: PacketMeta) => {
    if (!ignoredPackets.includes(packetMeta.name))
      packets.push({
        name: packetMeta.name,
        timestamp: Date.now().toString(),
        packet: data,
      });
  };

  const timeout = command.getNumberArgument(args, 0);

  command.player.proxy.on('incoming', callback);
  command.player.lcPlayer.sendNotification(
    `Dumping packets for ${timeout}ms...`,
    2500
  );

  setTimeout(async () => {
    command.player.proxy.removeListener('incoming', callback);
    await fs.writeFile('packetDump.json', JSON.stringify(packets, null, 2));

    command.player.lcPlayer.sendNotification(
      `Dumped ${packets.length} packets to packetDump.json`,
      25000
    );
  }, timeout);
};

export default command;
