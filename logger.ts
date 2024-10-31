import { logger } from "log";

var logs: string[] = [];

export default class Logger {
  public static log(msg: string): void {
    logger.log(msg);
    console.log(msg);
    logs.push(msg);
  }

  public static debug(msg: string): void {
    logger.debug(msg);
    console.debug(msg);
    logs.push(msg);
  }

  public static info(msg: string): void {
    logger.info(msg);
    console.info(msg);
    logs.push(msg);
  }

  public static warn(msg: string): void {
    logger.warn(msg);
    console.warn(msg);
    logs.push(msg);
  }

  public static error(msg: string): void {
    logger.error(msg);
    console.error(msg);
    logs.push(msg);
  }

  public static getLogs(): string[] {
    return logs;
  }

  public static clearLogs(): void {
    logs = [];
  }
}
