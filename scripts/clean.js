const fs = require('fs');
const { join } = require('path');

function handleENOENT(error) {
  if (!error.message.includes('ENOENT')) throw error;
}

try {
  console.log('info: cleaning build folder... 🏗️');
  fs.rmSync(join(__dirname, '..', 'build'), { recursive: true });
} catch (error) {
  handleENOENT(error);
}

try {
  console.log('info: cleaning dist folder... 🚚️');
  fs.rmSync(join(__dirname, '..', 'dist', 'solarstats.exe'));
} catch (error) {
  handleENOENT(error);
}

console.log('info: clean complete! 🗑️\n');
