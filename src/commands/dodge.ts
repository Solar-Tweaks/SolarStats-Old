import Command from '../Classes/Command';

const dodge = new Command('dodge', ['d']);

dodge.onTriggered = (): void => {
  dodge.player.dodge();
};

export default dodge;
