import { NewPingResult, ping } from 'minecraft-protocol';

export default async function (
  host: string,
  port: number = 25565
): Promise<NewPingResult> {
  return new Promise<NewPingResult>((resolve, reject) => {
    ping({ host, port, version: '1.18' }, (error, result) => {
      if (error) {
        console.error(
          'Failed to ping server, are you connected to internet?',
          error
        );
        process.exit(1);
      }
      if (isNewPingResult(result)) resolve(result);
      else console.error('Received old ping result, this should not happen.');
    });
  });
}

function isNewPingResult(value: any): value is NewPingResult {
  return (
    value &&
    typeof value === 'object' &&
    value.hasOwnProperty('description') &&
    value.hasOwnProperty('players') &&
    value.hasOwnProperty('version') &&
    value.hasOwnProperty('latency')
  );
}
