# Solar Stats 📊
![Discord](https://img.shields.io/discord/880500602910679112?color=404eed&logo=discord&logoColor=%23fff&style=for-the-badge)
![GitHub](https://img.shields.io/github/license/Solar-Tweaks/SolarStats?style=for-the-badge)
![Maintenance](https://img.shields.io/maintenance/yes/2022?style=for-the-badge)

Minecraft proxy server for Hypixel. It's like a stats overlay, but better. This program will be integrated in Solar Tweaks V4. For now you can build it by yourself and enhoy it before a release. And ss a lot of our projects, this one is also open source!

**⚠️ But this version may have bugs!**

# Downloading ⬇️
For now you must [build it yourself](#building-from-source-%EF%B8%8F).

# Usage ⚒️

To use it you need to have [NodeJS](https://nodejs.org/en/) installed. *(LTS version is recommended)*

## Configuration ⚙️
At the root of the project create a `config.json` file with the following content: *(You can also find the content of this file in the `config.example.jsonc` file)*
```json5
{
  "api_key": "", // Your Hypixel API key (`/api` in game)
  "dodge": {
    "enabled": true, // Whether or not to use auto dodge
    // (If false you will still be able to use the '/dodge' command)
    // Dodge when:
    "nicked": true, // Player is nicked
    "winStreak": 10, // Player has a winstreak of 10 or more
    "bestWinStreak": 25, // Player's best winstreak is 25 or more
    "sendStats": false // Send stats even if the game has been dodged
  }
}
```

## Starting the server 🚀
Make sure to [have built](#building-from-source-%EF%B8%8F) the server before starting it.
Run the following command
```bash
$ npm run start
```

# Building from source 🏗️
Clone the repository on your machine using
```bash
$ git clone https://github.com/Solar-Tweaks/SolarStats
```
Once the repo is downloaded move to the directory and install the dependencies
```bash
$ cd SolarStats
$ npm install
```
Finally build the project using
```bash
$ npm run build
```