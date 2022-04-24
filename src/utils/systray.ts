import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import SysTray, { MenuItem } from 'systray';
import { reloadConfig } from '..';
import Logger from '../Classes/Logger';

export default function setupTray(): SysTray {
  if (process.argv.includes('--noTray')) return null;

  const items: MenuItem[] = [];

  if (process.platform === 'win32')
    items.push({
      title: 'Hide/Show window',
      tooltip: 'Hide or show the terminal window',
      checked: false,
      enabled: true,
    });

  items.push(
    {
      title: 'Reload config',
      tooltip: 'Reload Solar Stats Config',
      checked: false,
      enabled: true,
    },
    {
      title: 'Exit',
      tooltip: 'Shutdown Solar Stats',
      checked: false,
      enabled: true,
    }
  );

  const systray = new SysTray({
    menu: {
      title: 'Solar Stats',
      tooltip: 'Solar Stats Proxy',
      icon: readFileSync(
        join(__dirname, '..', '..', 'assets', 'icon.ico'),
        'base64'
      ),
      items,
    },
    copyDir: true,
  });

  systray.onClick(async (event) => {
    // Can't rely on `seq_id` because the menu depends on the os
    switch (event.item.title) {
      case 'Reload config':
        await reloadConfig();
        Logger.info('Config reloaded');
        break;
      case 'Hide/Show window':
        // When no `visible` argument is passed, the visibility is toggled
        Logger.warn('Window visibility is not implemented yet');
        break;
      case 'Exit':
        systray.kill();
        process.exit(0);
      default:
        break;
    }
  });

  return systray;
}
