import axios from 'axios';
import { readFile } from 'fs/promises';
import * as https from 'https';
import { DownloaderHelper } from 'node-downloader-helper';
import { join } from 'path';
import { config, isPacked } from '..';
import Logger from '../Classes/Logger';

export default async function update() {
  Logger.info('Checking for updates...');
  const check = await checkForUpdates().catch((error) => {
    Logger.warn('Could not check for updates, aborting update process.', error);
    return { updated: false } as { updated: false };
  });

  if (!check.updated) return Logger.info('Solar Stats is up to date!');

  Logger.info(
    `Solar Stats ${check.newVersion} is available! (Current version: ${check.currentVersion})`
  );

  if (!config.autoDownloadUpdates) return;
  await downloadVersion(check.newVersion).catch((error) => {
    Logger.error('Could not download update.', error);
  });
}

async function checkForUpdates(): Promise<{
  updated: boolean;
  currentVersion: string;
  newVersion?: string;
}> {
  const { data: index } = await axios.get(
    'https://server.solartweaks.com/api/updater/index',
    {
      // Safe because not transmitting sensitive data
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    }
  );

  if (!index.ok) throw new Error('Could not check for updates');

  const version: string = JSON.parse(
    await readFile(
      isPacked ? join(__dirname, '..', '..', 'package.json') : 'package.json',
      'utf8'
    )
  ).version;
  const latestVersion = index.index.stable.solarstats.replace(/[^0-9]+/g, '');

  return {
    updated: latestVersion > version.replace(/[^0-9]+/g, ''), // True if update, false is up to date
    currentVersion: version,
    newVersion:
      latestVersion > version ? index.index.stable.solarstats : undefined,
  };
}

async function downloadVersion(version: string): Promise<void> {
  const download = new DownloaderHelper(
    `https://server.solartweaks.com/api/updater?item=solarstats&version=${version}`,
    process.cwd(),
    {
      fileName: `Solar Stats v${version}.exe`,
      httpsRequestOptions: {
        // Safe because not transmitting sensitive data
        agent: new https.Agent({ rejectUnauthorized: false }),
      },
    }
  );

  download.on('end', () =>
    Logger.info(
      `Update downloaded! Next time run the new executable (${join(
        process.cwd(),
        `Solar Stats v${version}.exe`
      )})`
    )
  );
  download.on('error', (stats) =>
    Logger.error('Could not download update.', stats)
  );
  await download
    .start()
    .catch((reason) => Logger.error('Could not download update.', reason));
}
