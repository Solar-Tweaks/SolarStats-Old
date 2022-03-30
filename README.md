# Solar Stats 📊

![Discord](https://img.shields.io/discord/930481786797064242?color=404eed&logo=discord&logoColor=%23fff&style=for-the-badge)
![GitHub](https://img.shields.io/github/license/Solar-Tweaks/SolarStats?style=for-the-badge)
![Maintenance](https://img.shields.io/maintenance/yes/2022?style=for-the-badge)

Minecraft proxy server for Hypixel. It's like a stats overlay, but better. This program will be integrated in Solar Tweaks V4. For now you can build it by yourself and enjoy it before a release. And as a lot of our projects, this one is also open source!

**⚠️ But this version may have bugs!**

# Downloading ⬇️

For now you must [build it yourself](#building-from-source-%EF%B8%8F).

# Usage ⚒️

To use it you need to have [NodeJS](https://nodejs.org/en/) installed. _(LTS version is recommended)_

## Configuration ⚙️

At the root of the project (or in the same directory as the executable) create a `config.json` file with the following content: _(You can also find the content of this file in the `config.example.jsonc` file)_

<!-- prettier-ignore-start -->
```json5
{
  "apiKey": "", // Your Hypixel API key (`/api` in game)
  "heightLimitDelayFix": true, // Makes the delay before a block is removed when above the height ultra fast,
  "bedwarsWaypoints": true, // Enable waypoints for Bedwars
  "lunarCooldowns": true, // Enable Lunar cooldown mod (arrow in bridge for example)
  "bedwarsTeammates": true, // Make the TeamView mod work for Bedwars
  "server": {
    // Server to connect to
    "host": "hypixel.net", // IP of the server
    "port": 25565 // Port of the server
  }
}
```
<!-- prettier-ignore-end -->

## Starting the server 🚀

Make sure to [have built](#building-from-source-%EF%B8%8F) the server before starting it.

### With NodeJS

```bash
$ npm start
```

### With the executable

Just execute the executable file. For non windows operating system you can use

```bash
$ .\path\to\executable
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

You can now build the project, you will be able to use the exe file located in the `dist` folder. Or use the `npm start` command to directly run the compiled TypeScript

```bash
$ npm run build
```

# Authenticating 🔒

When you will login for the first time you will see in the console a message like this:

```bash
[msa] First time signing in. Please authenticate now:
To sign in, use a web browser to open the page https://www.microsoft.com/link and enter the code XXXXXXXX to authenticate.
```

Open a browser and login with your Microsoft account.
If you have not migrated your account yet you can try to edit the code manually. _(Or migrate your account)_

**⚠️ Mojang accounts wont be supported!**
