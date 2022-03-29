const { execSync } = require('child_process');

function run(executable, params) {
  execSync(`${executable} ${params.join(' ')}`, {
    shell: true,
    stdio: 'inherit',
  });
}

console.log('info: compiling typescript 💽');
run('npx', ['tsc']);

console.log('info: obfuscating stats module 🔒');
run('node', ['./scripts/obfuscation.js']);

console.log('info: packaging app 📦\n');
run('pkg', ['.', '--compress=GZip']);

console.log(
  '\ninfo: build successful! 🎉\n -> Run the app using `npm start`\n -> For production, use the executable inside the `dist` folder\n'
);
