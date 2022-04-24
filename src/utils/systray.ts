import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import SysTray, { MenuItem } from 'systray';
import { reloadConfig } from '..';
import Logger from '../Classes/Logger';

export default function setupTray(): SysTray {
  if (process.argv.includes('--noTray')) return null;

  const items: MenuItem[] = [
    {
      title: 'Show window',
      tooltip: 'Hide or show the terminal window',
      checked: false,
      enabled: process.platform === 'win32',
    },
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
    },
  ];

  const systray = new SysTray({
    menu: {
      title: 'Solar Stats',
      tooltip:
        'Click to see Solar Stats tray menu. Take actions easily from here.',
      icon: readFileSync(
        join(__dirname, '..', '..', 'assets', 'icon.ico'),
        'base64'
      ),
      items,
    },
    copyDir: true,
  });

  systray.onClick(async (event) => {
    switch (event.seq_id) {
      case 0:
        // When no `visible` argument is passed, the visibility is toggled
        Logger.warn('Window visibility is not implemented yet');
        systray.sendAction({
          type: 'update-item',
          item: {
            ...event.item,
            checked: !event.item.checked,
          },
          seq_id: event.seq_id,
        });
        break;
      case 1:
        await reloadConfig();
        Logger.info('Config reloaded');
        break;
      case 2:
        systray.kill();
        process.exit(0);
      default:
        break;
    }
  });

  return systray;
}
