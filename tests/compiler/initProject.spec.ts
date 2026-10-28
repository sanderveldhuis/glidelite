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

import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';
import { initProject } from '../../src/compiler/initProject';
import * as sysUtils from '../../src/compiler/sysUtils';

describe('initProject.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validate when the GlideLite config already exists', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const exists = vi.spyOn(sysUtils, 'exists');

    exists.mockReturnValueOnce(true);
    initProject('test');

    if ('win32' === process.platform) {
      expect(exists).toHaveBeenCalledTimes(1);
      expect(exists).toHaveBeenLastCalledWith('test\\glconfig.json');
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenLastCalledWith('error GL2010:', "A 'glconfig.json' file already defined at: 'test\\glconfig.json'.");
    }
    else {
      expect(exists).toHaveBeenCalledTimes(1);
      expect(exists).toHaveBeenLastCalledWith('test/glconfig.json');
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenLastCalledWith('error GL2010:', "A 'glconfig.json' file already defined at: 'test/glconfig.json'.");
    }
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(2010);
  });

  it('validate when the TypeScript config already exists', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const exists = vi.spyOn(sysUtils, 'exists');

    exists.mockReturnValueOnce(false).mockReturnValueOnce(true);
    initProject('test');

    if ('win32' === process.platform) {
      expect(exists).toHaveBeenCalledTimes(2);
      expect(exists).toHaveBeenNthCalledWith(1, 'test\\glconfig.json');
      expect(exists).toHaveBeenNthCalledWith(2, 'test\\tsconfig.json');
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenLastCalledWith('error GL2010:', "A 'tsconfig.json' file already defined at: 'test\\tsconfig.json'.");
    }
    else {
      expect(exists).toHaveBeenNthCalledWith(1, 'test/glconfig.json');
      expect(exists).toHaveBeenNthCalledWith(2, 'test/tsconfig.json');
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenLastCalledWith('error GL2010:', "A 'tsconfig.json' file already defined at: 'test/tsconfig.json'.");
    }
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(2010);
  });

  it('validate when the Vite config already exists', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const exists = vi.spyOn(sysUtils, 'exists');

    exists.mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(true);
    initProject('test');

    if ('win32' === process.platform) {
      expect(exists).toHaveBeenCalledTimes(3);
      expect(exists).toHaveBeenNthCalledWith(1, 'test\\glconfig.json');
      expect(exists).toHaveBeenNthCalledWith(2, 'test\\tsconfig.json');
      expect(exists).toHaveBeenNthCalledWith(3, 'test\\frontend\\vite.config.ts');
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenLastCalledWith('error GL2010:', "A 'vite.config.ts' file already defined at: 'test\\frontend\\vite.config.ts'.");
    }
    else {
      expect(exists).toHaveBeenCalledTimes(3);
      expect(exists).toHaveBeenNthCalledWith(1, 'test/glconfig.json');
      expect(exists).toHaveBeenNthCalledWith(2, 'test/tsconfig.json');
      expect(exists).toHaveBeenNthCalledWith(3, 'test/frontend\\vite.config.ts');
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenLastCalledWith('error GL2010:', "A 'vite.config.ts' file already defined at: 'test/frontend/vite.config.ts'.");
    }
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(2010);
  });

  it('validate when the index HTML already exists', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const exists = vi.spyOn(sysUtils, 'exists');

    exists.mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(true);
    initProject('test');

    if ('win32' === process.platform) {
      expect(exists).toHaveBeenCalledTimes(4);
      expect(exists).toHaveBeenNthCalledWith(1, 'test\\glconfig.json');
      expect(exists).toHaveBeenNthCalledWith(2, 'test\\tsconfig.json');
      expect(exists).toHaveBeenNthCalledWith(3, 'test\\frontend\\vite.config.ts');
      expect(exists).toHaveBeenNthCalledWith(4, 'test\\frontend\\index.html');
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenLastCalledWith('error GL2010:', "A 'index.html' file already defined at: 'test\\frontend\\index.html'.");
    }
    else {
      expect(exists).toHaveBeenCalledTimes(4);
      expect(exists).toHaveBeenNthCalledWith(1, 'test/glconfig.json');
      expect(exists).toHaveBeenNthCalledWith(2, 'test/tsconfig.json');
      expect(exists).toHaveBeenNthCalledWith(3, 'test/frontend/vite.config.ts');
      expect(exists).toHaveBeenNthCalledWith(4, 'test/frontend/index.html');
      expect(consoleError).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenLastCalledWith('error GL2010:', "A 'index.html' file already defined at: 'test/frontend/index.html'.");
    }
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(2010);
  });

  it('validate when the project is initialized', () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {/*Emtpy*/});
    const makeFile = vi.spyOn(sysUtils, 'makeFile').mockImplementation(() => {/*Emtpy*/});
    const makeDir = vi.spyOn(sysUtils, 'makeDir').mockImplementation(() => {/*Emtpy*/});
    const exists = vi.spyOn(sysUtils, 'exists');

    exists.mockReturnValue(false);
    initProject('test');

    if ('win32' === process.platform) {
      expect(exists).toHaveBeenCalledTimes(4);
      expect(exists).toHaveBeenNthCalledWith(1, 'test\\glconfig.json');
      expect(exists).toHaveBeenNthCalledWith(2, 'test\\tsconfig.json');
      expect(exists).toHaveBeenNthCalledWith(3, 'test\\frontend\\vite.config.ts');
      expect(exists).toHaveBeenNthCalledWith(4, 'test\\frontend\\index.html');
      expect(makeFile).toHaveBeenCalledTimes(9);
      expect(makeDir).toHaveBeenCalledTimes(7);
      expect(makeFile).toHaveBeenNthCalledWith(1, 'test\\glconfig.json', '{\n}\n');
      expect(makeFile).toHaveBeenNthCalledWith(2, 'test\\tsconfig.json', '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["backend/**/*", "shared/**/*"]\n}\n');
      expect(makeDir).toHaveBeenNthCalledWith(1, 'test\\backend');
      expect(makeDir).toHaveBeenNthCalledWith(2, 'test\\backend\\api\\middleware');
      expect(makeFile).toHaveBeenNthCalledWith(3, 'test\\backend\\api\\middleware\\.gitkeep', '');
      expect(makeDir).toHaveBeenNthCalledWith(3, 'test\\backend\\api\\routers');
      expect(makeFile).toHaveBeenNthCalledWith(4, 'test\\backend\\api\\routers\\.gitkeep', '');
      expect(makeDir).toHaveBeenNthCalledWith(4, 'test\\backend\\workers');
      expect(makeFile).toHaveBeenNthCalledWith(5, 'test\\backend\\workers\\.gitkeep', '');
      expect(makeDir).toHaveBeenNthCalledWith(5, 'test\\frontend');
      expect(makeFile).toHaveBeenNthCalledWith(6, 'test\\frontend\\vite.config.ts', "import react from '@vitejs/plugin-react';\nimport { glConfig } from 'glidelite/vite';\nimport { defineConfig } from 'vite';\n\n// https://vite.dev/config/\nexport default defineConfig({\n  ...glConfig,\n  plugins: [react()]\n});\n");
      expect(makeFile).toHaveBeenNthCalledWith(7, 'test\\frontend\\index.html', '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>GlideLite · An end-to-end CLI for modern web apps</title>\n  </head>\n  <body>\n    Welcome to GlideLite!\n  </body>\n</html>\n');
      expect(makeDir).toHaveBeenNthCalledWith(6, 'test\\frontend\\public');
      expect(makeFile).toHaveBeenNthCalledWith(8, 'test\\frontend\\public\\.gitkeep', '');
      expect(makeDir).toHaveBeenNthCalledWith(7, 'test\\shared');
      expect(makeFile).toHaveBeenNthCalledWith(9, 'test\\shared\\.gitkeep', '');
    }
    else {
      expect(exists).toHaveBeenCalledTimes(4);
      expect(exists).toHaveBeenNthCalledWith(1, 'test/glconfig.json');
      expect(exists).toHaveBeenNthCalledWith(2, 'test/tsconfig.json');
      expect(exists).toHaveBeenNthCalledWith(3, 'test/frontend/vite.config.ts');
      expect(exists).toHaveBeenNthCalledWith(4, 'test/frontend/index.html');
      expect(makeFile).toHaveBeenCalledTimes(9);
      expect(makeDir).toHaveBeenCalledTimes(7);
      expect(makeFile).toHaveBeenNthCalledWith(1, 'test/glconfig.json', '{\n}\n');
      expect(makeFile).toHaveBeenNthCalledWith(2, 'test/tsconfig.json', '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["backend/**/*", "shared/**/*"]\n}\n');
      expect(makeDir).toHaveBeenNthCalledWith(1, 'test/backend');
      expect(makeDir).toHaveBeenNthCalledWith(2, 'test/backend/api/middleware');
      expect(makeFile).toHaveBeenNthCalledWith(3, 'test/backend/api/middleware/.gitkeep', '');
      expect(makeDir).toHaveBeenNthCalledWith(3, 'test/backend/api/routers');
      expect(makeFile).toHaveBeenNthCalledWith(4, 'test/backend/api/routers/.gitkeep', '');
      expect(makeDir).toHaveBeenNthCalledWith(4, 'test/backend/workers');
      expect(makeFile).toHaveBeenNthCalledWith(5, 'test/backend/workers/.gitkeep', '');
      expect(makeDir).toHaveBeenNthCalledWith(5, 'test/frontend');
      expect(makeFile).toHaveBeenNthCalledWith(6, 'test/frontend/vite.config.ts', "import react from '@vitejs/plugin-react';\nimport { glConfig } from 'glidelite/vite';\nimport { defineConfig } from 'vite';\n\n// https://vite.dev/config/\nexport default defineConfig({\n  ...glConfig,\n  plugins: [react()]\n});\n");
      expect(makeFile).toHaveBeenNthCalledWith(7, 'test/frontend/index.html', '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>GlideLite · An end-to-end CLI for modern web apps</title>\n  </head>\n  <body>\n    Welcome to GlideLite!\n  </body>\n</html>\n');
      expect(makeDir).toHaveBeenNthCalledWith(6, 'test/frontend/public');
      expect(makeFile).toHaveBeenNthCalledWith(8, 'test/frontend/public/.gitkeep', '');
      expect(makeDir).toHaveBeenNthCalledWith(7, 'test/shared');
      expect(makeFile).toHaveBeenNthCalledWith(9, 'test/shared/.gitkeep', '');
    }
    expect(consoleLog).toHaveBeenCalledTimes(1);
    expect(consoleLog).toHaveBeenLastCalledWith("Created a new GlideLite project at: 'test'.");
  });
});
