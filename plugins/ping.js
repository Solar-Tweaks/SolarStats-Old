// Creating the command
// See src/Classes/Command.ts for more information
const cmd = new toolbox.Command(
  'ping', // Command name
  [], // Command syntax
  ['ping2'] // Command aliases
);

cmd.onTriggered = () => {
  // Code executed when the command is triggered
  player.sendMessage('Pong!');
};

// Registering the command
registerCommand(cmd);

// Registering the plugin
registerPlugin({
  name: 'Ping',
  description: 'Simple ping/pong command',
  version: '1.0.0', // Optional
  author: 'RichardDorian', // Optional
});
