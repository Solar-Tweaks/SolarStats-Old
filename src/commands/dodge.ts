import Command from '../Classes/Command';

const dodge = new Command('dodge', ['d']);

dodge.onTriggered = async (): Promise<void> => {
  await dodge.player.dodge();
};

export default dodge;
