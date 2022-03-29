const { spawnSync } = require('child_process');
const fs = require('fs');
const { join } = require('path');

function run(executable, params) {
  spawnSync(executable, params, { shell: true, stdio: 'inherit' });
}

const cwd = process.cwd();

console.log('info: verifying minecraft-protocol-lunarclient 🔎');
console.log(`debug: working directory @ ${cwd} 📂`);

if (
  fs.existsSync(
    join(cwd, 'node_modules', '@solar-tweaks', 'minecraft-protocol-lunarclient')
  )
) {
  console.log(
    '\ninfo: minecraft-protocol-lunarclient successfully installed 🎉'
  );
} else {
  console.log(
    '\ninfo: minecraft-protocol-lunarclient not found, installing manually 📦'
  );
  run('npm', [
    'i',
    'https://github.com/Solar-Tweaks/minecraft-protocol-lunarclient',
  ]);
}
