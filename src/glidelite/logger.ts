/**
 * MIT License
 *
 * Copyright (c) 2025 Sander Veldhuis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Generic logger for all GlideLite modules ensuring uniform output.
 */
export class Logger {
  name: string;

  /**
   * Constructs a new logger.
   * @param name the logger name
   */
  constructor(name: string) {
    this.name = name;
  }

  /**
   * Log an error message.
   * ```js
   * const count = 5;
   * // Both logs: count: 5
   * log.application.error('count: %d', count);
   * log.application.error('count:', count);
   * ```
   * @param message the primary message
   * @param optionalParams additional parameters
   */
  error(message: any, ...optionalParams: any[]): void /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
    console.error(`ERR:${this.name}:${message}`, ...optionalParams); /* eslint-disable-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/restrict-template-expressions */
  }

  /**
   * Log a warning message.
   * ```js
   * const count = 5;
   * // Both logs: count: 5
   * log.application.warn('count: %d', count);
   * log.application.warn('count:', count);
   * ```
   * @param message the primary message
   * @param optionalParams additional parameters
   */
  warn(message: any, ...optionalParams: any[]): void /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
    console.log(`WRN:${this.name}:${message}`, ...optionalParams); /* eslint-disable-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/restrict-template-expressions */
  }

  /**
   * Log an information message.
   * ```js
   * const count = 5;
   * // Both logs: count: 5
   * log.application.info('count: %d', count);
   * log.application.info('count:', count);
   * ```
   * @param message the primary message
   * @param optionalParams additional parameters
   */
  info(message: any, ...optionalParams: any[]): void /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
    console.log(`INF:${this.name}:${message}`, ...optionalParams); /* eslint-disable-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/restrict-template-expressions */
  }

  /**
   * Log a debug message.
   * ```js
   * const count = 5;
   * // Both logs: count: 5
   * log.application.debug('count: %d', count);
   * log.application.debug('count:', count);
   * ```
   * @param message the primary message
   * @param optionalParams additional parameters
   */
  debug(message: any, ...optionalParams: any[]): void /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
    console.log(`DBG:${this.name}:${message}`, ...optionalParams); /* eslint-disable-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/restrict-template-expressions */
  }
}

/**
 * Generic logger for all GlideLite modules ensuring uniform output is written to log files on the deployment system.
 */
export const log: Record<string, Logger> = new Proxy({}, {
  /**
   * The proxy is used to trap getting a specific logger by name and creates the logger if it does not yet exist.
   * @param target the target with created loggers, default empty
   * @param name the logger name
   * @returns the existing or newly created logger
   */
  get(target: Record<string, Logger>, name: string) {
    return target[name] ?? (target[name] = new Logger(name));
  }
});
