import Command from '../Classes/Command';

const command = new Command('dodge', ['d']);

command.onTriggered = async (): Promise<void> => {
  await command.player.dodge();
};

export default command;
