import * as chalk from 'chalk';

export default class Logger {
  public static info(...args: any[]): void {
    console.log(chalk.bgBlue.white(' INFO '), ...args);
  }

  public static warn(...args: any[]): void {
    console.warn(chalk.bgYellow.black(' WARN '), ...args);
  }

  public static error(...args: any[]): void {
    console.error(chalk.bgRed.white(' ERROR '), ...args);
  }
}
