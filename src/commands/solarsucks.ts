// 👀 MHMMM

import { exec } from 'child_process';
import Command from '../Classes/Command';

const command = new Command('solarsucks', [], ['solarsuck']);

command.onTriggered = () => {
  const command =
    process.platform == 'darwin'
      ? 'open'
      : process.platform == 'win32'
      ? 'start'
      : 'xdg-open';
  const urls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=fC7oUOUEEi4',
  ];
  exec(`${command} ${urls[Math.floor(Math.random() * urls.length)]}`);
};

export default command;
