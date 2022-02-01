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
  const packets: { name: string; packet: unknown }[] = [];
  let ignoredPackets: string[] = command.getArrayArgument(
    args,
    1,
    true
  ) as string[];

  const callback = (data: unknown, packetMeta: PacketMeta) => {
    if (!ignoredPackets.includes(packetMeta.name))
      packets.push({ name: packetMeta.name, packet: data });
  };

  const timeout = command.getNumberArgument(args, 0);

  command.player.proxy.on('incoming', callback);
  command.player.sendNotification(`Dumping packets for ${timeout}ms...`);

  setTimeout(async () => {
    command.player.proxy.removeListener('incoming', callback);
    await fs.writeFile('packetDump.json', JSON.stringify(packets, null, 2));

    command.player.sendNotification(
      `Dumped ${packets.length} packets to packetDump.json`
    );
  }, timeout);
};

export default command;
