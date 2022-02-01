import Command from '../Classes/Command';

const command = new Command('reqeue', [], ['rq', 'req']);

command.onTriggered = () => {
  const lastGameMode = command.player.lastGameMode;
  if (lastGameMode)
    command.player.executeCommand(`/play ${lastGameMode.toLowerCase()}`);
  else
    command.player.sendMessage(
      '§cYou have not played a game since you connected!'
    );
};

export default command;
