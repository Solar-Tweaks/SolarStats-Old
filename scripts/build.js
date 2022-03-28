const { spawnSync } = require('child_process');

function run(executable, params) {
  spawnSync(executable, params, { shell: true, stdio: 'inherit' });
}

console.log('info: compiling typescript');
run('npx', ['tsc']);

console.log('info: obfuscating stats module');
run('node', ['./scripts/obfuscation.js']);

console.log('info: packaging app');
run('pkg', ['.', '--compress=GZip']); // TODO: Make the compression works (maybe a library issue)
