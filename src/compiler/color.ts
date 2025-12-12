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
 * Converts the specified string to bold terminal output.
 * @param str the string
 * @returns the bold terminal output
 */
export function bold(str: string): string {
  return `\x1b[1m${str}\x1b[22m`;
}

/**
 * Converts the specified string to blue terminal output.
 * @param str the string
 * @returns the blue terminal output
 */
export function blue(str: string): string {
  return `\x1b[94m${str}\x1b[39m`;
}

/**
 * Converts the specified string to yellow terminal output.
 * @param str the string
 * @returns the yellow terminal output
 */
export function yellow(str: string): string {
  return `\x1b[93m${str}\x1b[39m`;
}
