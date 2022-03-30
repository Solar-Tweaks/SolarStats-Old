const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');
const Obfuscator = require('javascript-obfuscator');

const moduleLocation = join(
  process.cwd(),
  'build',
  'player',
  'modules',
  'stats.js'
);

if (!existsSync(moduleLocation)) {
  console.log("info: stats module was not present, skipping obfuscation ⏭️");
  process.exit(0);
}

const obfuscated = Obfuscator.obfuscate(readFileSync(moduleLocation, 'utf8'), {
  target: 'node',
  seed: Math.floor(Math.random * 100000),
  stringArray: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayThreshold: 0.75,
  stringArrayIndexShift: true,
  stringArrayIndexesType: ['hexadecimal-number'],
  stringArrayWrappersCount: 2,
  stringArrayWrappersType: 'function',
  // stringArrayWrappersParametersMaxCount: 4,
  // stringArrayWrappersChainedCalls: true,
  stringArrayEncoding: ['base64'],
  splitStrings: true,
  // unicodeEscapeSequence: true,
  // identifierNamesGenerator: 'hexadecimal',
  compact: true,
  // simplify: true,
  // transformObjectKeys: true,
  // numbersToExpressions: true,
  // controlFlowFlattening: true,
  // controlFlowFlatteningThreshold: 0.75,
  // deadCodeInjection: true,
  // deadCodeInjectionThreshold: 0.75,
  renameGlobals: true,
  reservedStrings: [
    '../../utils/formatStats',
    '../../utils/hypixel',
    '../PlayerModule',
  ],
});

writeFileSync(moduleLocation, obfuscated.getObfuscatedCode(), 'utf8');
