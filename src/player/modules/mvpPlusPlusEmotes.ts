import { Client, PacketMeta, ServerClient } from 'minecraft-protocol';
import { config } from '../..';
import Item from '../../Classes/Item';
import PlayerModule from '../PlayerModule';

const settingItem = new Item(175);
settingItem.displayName = '§fMVP++ Emotes';
settingItem.lore = [
  '',
  '§7Send MVP++ emotes',
  '§7without having MVP++',
  '',
  `§7Current: §${config.modules.mvpppEmotes ? 'aEnabled' : 'cDisabled'}`,
];

const playerModule = new PlayerModule(
  'MVP++ Emotes',
  'Make MVP++ emotes available to all players',
  settingItem,
  'mvpppEmotes'
);

const base = {
  '<3': '❤',
  ':star:': '✮',
  ':yes:': '✔',
  ':no:': '✖',
  ':java:': '☕',
  ':arrow:': '➜',
  ':shrug:': '¯\\_(ツ)_/¯',
  ':tableflip:': '(╯°□°）╯︵ ┻━┻',
  'o/': '( ﾟ◡ﾟ)/',
  ':123:': '①②③',
  ':totem:': '☉_☉',
  ':typing:': '✎...',
  ':maths:': '√(π+x)=L',
  ':snail:': "@'-'",
  ':thinking:': '(0.o?)',
  ':gimme:': '༼つ ◕◕ ༽つ',
  ':wizard:': "('-')⊃━☆ﾟ.*･｡ﾟ",
  ':pvp:': '⚔',
  ':peace:': '✌',
  ':oof:': 'OOF',
  ':puffer:': "<('O')>",
  ':yey:': 'ヽ (◕◡◕) ﾉ',
  ':cat:': '= ＾● ⋏ ●＾ =',
  ':dab:': '<o/',
  ':dj:': 'ヽ(⌐■_■)ノ♬',
  ':snow:': '☃',
  '^_^': '^_^',
  'h/': 'ヽ(^◇^*)/',
  '^-^': '^-^',
  ':sloth:': '(・⊝・)',
  ':cute:': '(✿◠‿◠)',
  ':dog:': '(ᵔᴥᵔ)',
};

const emotes = {
  ...base,
  ...config.customEmotes,
};

const onOutgoingPacket = (
  data,
  meta: PacketMeta,
  toClient: ServerClient,
  toServer: Client
) => {
  if (meta.name !== 'chat') return;

  // Ignoring commands because they are handled by the command handler
  if (
    playerModule.player.commandHandler.commandsList.includes(
      data.message.toLowerCase().split(' ')[0]
    )
  )
    return;

  for (const syntax in emotes)
    if (
      Object.prototype.hasOwnProperty.call(emotes, syntax) &&
      config.modules.mvpppEmotes
    )
      data.message = data.message.replace(syntax, emotes[syntax]);
  toServer.write(meta.name, data);
};

playerModule.customCode = () => {
  playerModule.player.proxy.on('outgoing', onOutgoingPacket);
};

playerModule.onDisconnect = () => {
  playerModule.player.proxy.removeListener('outgoing', onOutgoingPacket);
};

export default playerModule;
