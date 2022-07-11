# Solar Stats 📊

![GitHub](https://img.shields.io/github/license/Solar-Tweaks/SolarStats?style=for-the-badge)
![Maintenance](https://img.shields.io/maintenance/yes/2022?style=for-the-badge)

Minecraft proxy server for Hypixel. It's like a stats overlay, but better. For now you must build it yourself and enjoy it before a release. And as a lot of our projects, this one is also open source!

**⚠️ But this version may have bugs!**

# Usage ⚒️

To use it you need to have [NodeJS](https://nodejs.org/en/) installed. _(LTS version is recommended)_

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

## Configuration ⚙️

At the root of the project (or in the same directory as the executable) create a `config.json` file with the following content:

<!-- prettier-ignore-start -->
```json5
{
  "apiKey": "API KEY HERE",
  "server": {
    "host": "hypixel.net",
    "port": 25565
  },
  "customEmotes": {
    ":solar:": "☀",
    ":lunar:": "☾"
  },
  "checkForUpdates": true,
  "autoDownloadUpdates": true,
  "statistics": true,
  "modules": {
    "bedwarsWaypoints": true,
    "heightLimitDelayFix": true,
    "lunarCooldowns": true,
    "bedwarsTeammates": true,
    "mvpppEmotes": true,
    "stats": true
  }
}
```
<!-- prettier-ignore-end -->

## Starting the server 🚀

### With NodeJS

```bash
$ npm start
```

### With the executable

Just execute the executable file. For non windows operating system you can use

```bash
$ .\path\to\executable
```

### Arguments

Solar Stats supports the following arguments:

- `--skipUpdater`: Skip the update check at startup
- `--noTracking`: Don't track statistics
- `--config=/path/to/config.json`: Use a custom config file (default config file is `config.json` in the current working directory)
- `--noTray`: Disable the tray icon

# Authenticating 🔒

When you will login for the first time you will see in the console a message like this:

```bash
[msa] First time signing in. Please authenticate now:
To sign in, use a web browser to open the page https://www.microsoft.com/link and enter the code XXXXXXXX to authenticate.
```

Open a browser and login with your Microsoft account.
If you have not migrated your account yet you can try to edit the code manually. _(Or migrate your account)_

**⚠️ Mojang accounts wont be supported!**
