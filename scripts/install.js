const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(executable, params) {
    spawnSync(executable, params, { shell: true, stdio: "inherit" });
}

// console.log("\ninfo: installing dependencies...\n");
// run("npm", ["i"]);

const cwd = process.cwd();

console.log("\ninfo: verifying minecraft-protocol-lunarclient");
console.log(`debug: working directory @ ${cwd}\n`);

if (fs.existsSync(path.join(cwd, "node_modules", "@solar-tweaks", "minecraft-protocol-lunarclient"))) {
    console.log("info: minecraft-protocol-lunarclient successfully installed");
}
else {
    console.log("info: minecraft-protocol-lunarclient not found, installing manually");
    run("npm", [ "i", "https://github.com/Solar-Tweaks/minecraft-protocol-lunarclient" ]);
}
