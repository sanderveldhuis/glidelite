"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.Logger = void 0;
/**
 * Generic logger for all GlideLite modules ensuring uniform output.
 */
class Logger {
    /**
     * Constructs a new logger.
     * @param name the logger name
     */
    constructor(name) {
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
    error(message, ...optionalParams) {
        console.error(`${String(Date.now())}:ERR:${this.name}:${message}`, ...optionalParams); /* eslint-disable-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/restrict-template-expressions */
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
    warn(message, ...optionalParams) {
        console.log(`${String(Date.now())}:WRN:${this.name}:${message}`, ...optionalParams); /* eslint-disable-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/restrict-template-expressions */
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
    info(message, ...optionalParams) {
        console.log(`${String(Date.now())}:INF:${this.name}:${message}`, ...optionalParams); /* eslint-disable-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/restrict-template-expressions */
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
    debug(message, ...optionalParams) {
        console.log(`${String(Date.now())}:DBG:${this.name}:${message}`, ...optionalParams); /* eslint-disable-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/restrict-template-expressions */
    }
}
exports.Logger = Logger;
/**
 * Generic logger for all GlideLite modules ensuring uniform output is written to log files on the deployment system.
 */
exports.log = new Proxy({}, {
    /**
     * The proxy is used to trap getting a specific logger by name and creates the logger if it does not yet exist.
     * @param target the target with created loggers, default empty
     * @param name the logger name
     * @returns the existing or newly created logger
     */
    get(target, name) {
        return target[name] ?? (target[name] = new Logger(name));
    }
});
