import { NewPingResult, ping } from 'minecraft-protocol';

export default async function (
  host: string,
  port = 25565
): Promise<NewPingResult> {
  return new Promise<NewPingResult>((resolve) => {
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
	Object.prototype.hasOwnProperty.call(value, 'description') &&
	Object.prototype.hasOwnProperty.call(value, 'players') &&
	Object.prototype.hasOwnProperty.call(value, 'version') &&
	Object.prototype.hasOwnProperty.call(value, 'latency')
  );
}
