import { config } from '../..';
import PlayerModule from '../PlayerModule';

const playerModule = new PlayerModule(
  'MVP++Emotes',
  'Make MVP++ emotes available to all players'
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

playerModule.customCode = () => {
  const player = playerModule.player;

  player.proxy.on('outgoing', (data, meta, toClient, toServer) => {
    if (meta.name !== 'chat') return;

    // Ignoring commands because they are handled by the command handler
    if (
      playerModule.player.commandHandler.commandsList.includes(
        data.message.toLowerCase().split(' ')[0]
      )
    )
      return;

    for (const syntax in emotes)
      if (Object.prototype.hasOwnProperty.call(emotes, syntax))
        data.message = data.message.replace(syntax, '§' + emotes[syntax]);
    toServer.write(meta.name, data);
  });
};

export default playerModule;
