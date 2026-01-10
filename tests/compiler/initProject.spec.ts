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

import sinon from 'ts-sinon';
import { initProject } from '../../src/compiler/initProject';
import * as sysUtils from '../../src/compiler/sysUtils';

describe('initProject.ts', () => {
  let consoleError: sinon.SinonStub;
  let consoleLog: sinon.SinonStub;
  let processExit: sinon.SinonStub;
  let exists: sinon.SinonStub;
  let makeDir: sinon.SinonStub;
  let makeFile: sinon.SinonStub;

  beforeEach(() => {
    consoleError = sinon.stub(console, 'error');
    consoleLog = sinon.stub(console, 'log');
    processExit = sinon.stub(process, 'exit');
    exists = sinon.stub(sysUtils, 'exists');
    makeDir = sinon.stub(sysUtils, 'makeDir');
    makeFile = sinon.stub(sysUtils, 'makeFile');
  });

  afterEach(() => {
    consoleError.restore();
    consoleLog.restore();
    processExit.restore();
    exists.restore();
    makeDir.restore();
    makeFile.restore();
  });

  it('validate when the GlideLite config already exists', () => {
    exists.returns(true);

    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledOnceWithExactly(exists, 'test\\glconfig.json');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2010:', "A 'glconfig.json' file already defined at: 'test\\glconfig.json'.");
    }
    else {
      sinon.assert.calledOnceWithExactly(exists, 'test/glconfig.json');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2010:', "A 'glconfig.json' file already defined at: 'test/glconfig.json'.");
    }
    sinon.assert.calledOnceWithExactly(processExit, 2010);
  });

  it('validate when the TypeScript config already exists', () => {
    exists.onCall(0).returns(false)
      .onCall(1).returns(true);

    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(0), 'test\\glconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'test\\backend\\workers\\tsconfig.json');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2010:', "A 'tsconfig.json' file already defined at: 'test\\backend\\workers\\tsconfig.json'.");
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(0), 'test/glconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'test/backend/workers/tsconfig.json');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2010:', "A 'tsconfig.json' file already defined at: 'test/backend/workers/tsconfig.json'.");
    }
    sinon.assert.calledOnceWithExactly(processExit, 2010);
  });

  it('validate when the Vite config already exists', () => {
    exists.onCall(0).returns(false)
      .onCall(1).returns(false)
      .onCall(2).returns(true);

    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(0), 'test\\glconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'test\\backend\\workers\\tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(2), 'test\\frontend\\vite.config.ts');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2010:', "A 'vite.config.ts' file already defined at: 'test\\frontend\\vite.config.ts'.");
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(0), 'test/glconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'test/backend/workers/tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(2), 'test/frontend/vite.config.ts');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2010:', "A 'vite.config.ts' file already defined at: 'test/frontend/vite.config.ts'.");
    }
    sinon.assert.calledOnceWithExactly(processExit, 2010);
  });

  it('validate when the index HTML already exists', () => {
    exists.onCall(0).returns(false)
      .onCall(1).returns(false)
      .onCall(2).returns(false)
      .onCall(3).returns(true);

    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(0), 'test\\glconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'test\\backend\\workers\\tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(2), 'test\\frontend\\vite.config.ts');
      sinon.assert.calledWithExactly(exists.getCall(3), 'test\\frontend\\index.html');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2010:', "A 'index.html' file already defined at: 'test\\frontend\\index.html'.");
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(0), 'test/glconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'test/backend/workers/tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(2), 'test/frontend/vite.config.ts');
      sinon.assert.calledWithExactly(exists.getCall(3), 'test/frontend/index.html');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2010:', "A 'index.html' file already defined at: 'test/frontend/index.html'.");
    }
    sinon.assert.calledOnceWithExactly(processExit, 2010);
  });

  it('validate when the 404 HTML already exists', () => {
    exists.onCall(0).returns(false)
      .onCall(1).returns(false)
      .onCall(2).returns(false)
      .onCall(3).returns(false)
      .onCall(4).returns(true);

    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(0), 'test\\glconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'test\\backend\\workers\\tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(2), 'test\\frontend\\vite.config.ts');
      sinon.assert.calledWithExactly(exists.getCall(3), 'test\\frontend\\index.html');
      sinon.assert.calledWithExactly(exists.getCall(4), 'test\\frontend\\public\\404.html');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2010:', "A '404.html' file already defined at: 'test\\frontend\\public\\404.html'.");
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(0), 'test/glconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'test/backend/workers/tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(2), 'test/frontend/vite.config.ts');
      sinon.assert.calledWithExactly(exists.getCall(3), 'test/frontend/index.html');
      sinon.assert.calledWithExactly(exists.getCall(4), 'test/frontend/public/404.html');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2010:', "A '404.html' file already defined at: 'test/frontend/public/404.html'.");
    }
    sinon.assert.calledOnceWithExactly(processExit, 2010);
  });

  it('validate when the 429 HTML already exists', () => {
    exists.onCall(0).returns(false)
      .onCall(1).returns(false)
      .onCall(2).returns(false)
      .onCall(3).returns(false)
      .onCall(4).returns(false)
      .onCall(5).returns(true);

    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(0), 'test\\glconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'test\\backend\\workers\\tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(2), 'test\\frontend\\vite.config.ts');
      sinon.assert.calledWithExactly(exists.getCall(3), 'test\\frontend\\index.html');
      sinon.assert.calledWithExactly(exists.getCall(4), 'test\\frontend\\public\\404.html');
      sinon.assert.calledWithExactly(exists.getCall(5), 'test\\frontend\\public\\429.html');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2010:', "A '429.html' file already defined at: 'test\\frontend\\public\\429.html'.");
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(0), 'test/glconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'test/backend/workers/tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(2), 'test/frontend/vite.config.ts');
      sinon.assert.calledWithExactly(exists.getCall(3), 'test/frontend/index.html');
      sinon.assert.calledWithExactly(exists.getCall(4), 'test/frontend/public/404.html');
      sinon.assert.calledWithExactly(exists.getCall(5), 'test/frontend/public/429.html');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2010:', "A '429.html' file already defined at: 'test/frontend/public/429.html'.");
    }
    sinon.assert.calledOnceWithExactly(processExit, 2010);
  });

  it('validate when the 500 HTML already exists', () => {
    exists.onCall(0).returns(false)
      .onCall(1).returns(false)
      .onCall(2).returns(false)
      .onCall(3).returns(false)
      .onCall(4).returns(false)
      .onCall(5).returns(false)
      .onCall(6).returns(true);

    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(0), 'test\\glconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'test\\backend\\workers\\tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(2), 'test\\frontend\\vite.config.ts');
      sinon.assert.calledWithExactly(exists.getCall(3), 'test\\frontend\\index.html');
      sinon.assert.calledWithExactly(exists.getCall(4), 'test\\frontend\\public\\404.html');
      sinon.assert.calledWithExactly(exists.getCall(5), 'test\\frontend\\public\\429.html');
      sinon.assert.calledWithExactly(exists.getCall(6), 'test\\frontend\\public\\500.html');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2010:', "A '500.html' file already defined at: 'test\\frontend\\public\\500.html'.");
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(0), 'test/glconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'test/backend/workers/tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(2), 'test/frontend/vite.config.ts');
      sinon.assert.calledWithExactly(exists.getCall(3), 'test/frontend/index.html');
      sinon.assert.calledWithExactly(exists.getCall(4), 'test/frontend/public/404.html');
      sinon.assert.calledWithExactly(exists.getCall(5), 'test/frontend/public/429.html');
      sinon.assert.calledWithExactly(exists.getCall(6), 'test/frontend/public/500.html');
      sinon.assert.calledOnceWithExactly(consoleError, 'error GL2010:', "A '500.html' file already defined at: 'test/frontend/public/500.html'.");
    }
    sinon.assert.calledOnceWithExactly(processExit, 2010);
  });

  it('validate when the project is initialized', () => {
    initProject('test');

    if ('win32' === process.platform) {
      sinon.assert.calledWithExactly(exists.getCall(0), 'test\\glconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'test\\backend\\workers\\tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(2), 'test\\frontend\\vite.config.ts');
      sinon.assert.calledWithExactly(exists.getCall(3), 'test\\frontend\\index.html');
      sinon.assert.calledWithExactly(exists.getCall(4), 'test\\frontend\\public\\404.html');
      sinon.assert.calledWithExactly(exists.getCall(5), 'test\\frontend\\public\\429.html');
      sinon.assert.calledWithExactly(exists.getCall(6), 'test\\frontend\\public\\500.html');
      sinon.assert.calledWithExactly(makeDir.getCall(0), 'test\\backend\\workers');
      sinon.assert.calledWithExactly(makeFile.getCall(0), 'test\\glconfig.json', '{}\n');
      sinon.assert.calledWithExactly(makeFile.getCall(1), 'test\\backend\\workers\\tsconfig.json', '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["**/*"]\n}\n');
      sinon.assert.calledWithExactly(makeDir.getCall(1), 'test\\frontend');
      sinon.assert.calledWithExactly(makeFile.getCall(2), 'test\\frontend\\vite.config.ts', "import react from '@vitejs/plugin-react';\nimport { defineConfig } from 'vite';\n\n// https://vite.dev/config/\nexport default defineConfig({\n  plugins: [react()]\n});\n");
      sinon.assert.calledWithExactly(makeFile.getCall(3), 'test\\frontend\\index.html', '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>GlideLite · An end-to-end CLI for modern web apps</title>\n  </head>\n  <body>\n    Welcome to GlideLite!\n  </body>\n</html>\n');
      sinon.assert.calledWithExactly(makeFile.getCall(4), 'test\\frontend\\public\\404.html', '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>404 Not Found · GlideLite</title>\n  </head>\n  <body>\n    Not found!\n  </body>\n</html>\n');
      sinon.assert.calledWithExactly(makeFile.getCall(5), 'test\\frontend\\public\\429.html', '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>429 Too Many Requests · GlideLite</title>\n  </head>\n  <body>\n    Too Many Requests!\n  </body>\n</html>\n');
      sinon.assert.calledWithExactly(makeFile.getCall(6), 'test\\frontend\\public\\500.html', '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>500 Internal Server Error · GlideLite</title>\n  </head>\n  <body>\n    Internal Server Error!\n  </body>\n</html>\n');
    }
    else {
      sinon.assert.calledWithExactly(exists.getCall(0), 'test/glconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(1), 'test/backend/workers/tsconfig.json');
      sinon.assert.calledWithExactly(exists.getCall(2), 'test/frontend/vite.config.ts');
      sinon.assert.calledWithExactly(exists.getCall(3), 'test/frontend/index.html');
      sinon.assert.calledWithExactly(exists.getCall(4), 'test/frontend/public/404.html');
      sinon.assert.calledWithExactly(exists.getCall(5), 'test/frontend/public/429.html');
      sinon.assert.calledWithExactly(exists.getCall(6), 'test/frontend/public/500.html');
      sinon.assert.calledWithExactly(makeDir.getCall(0), 'test/backend/workers');
      sinon.assert.calledWithExactly(makeFile.getCall(0), 'test/glconfig.json', '{}\n');
      sinon.assert.calledWithExactly(makeFile.getCall(1), 'test/backend/workers/tsconfig.json', '{\n  "extends": "@tsconfig/node-lts/tsconfig.json",\n  "include": ["**/*"]\n}\n');
      sinon.assert.calledWithExactly(makeDir.getCall(1), 'test/frontend');
      sinon.assert.calledWithExactly(makeFile.getCall(2), 'test/frontend/vite.config.ts', "import react from '@vitejs/plugin-react';\nimport { defineConfig } from 'vite';\n\n// https://vite.dev/config/\nexport default defineConfig({\n  plugins: [react()]\n});\n");
      sinon.assert.calledWithExactly(makeFile.getCall(3), 'test/frontend/index.html', '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>GlideLite · An end-to-end CLI for modern web apps</title>\n  </head>\n  <body>\n    Welcome to GlideLite!\n  </body>\n</html>\n');
      sinon.assert.calledWithExactly(makeFile.getCall(4), 'test/frontend/public/404.html', '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>404 Not Found · GlideLite</title>\n  </head>\n  <body>\n    Not found!\n  </body>\n</html>\n');
      sinon.assert.calledWithExactly(makeFile.getCall(5), 'test/frontend/public/429.html', '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>429 Too Many Requests · GlideLite</title>\n  </head>\n  <body>\n    Too Many Requests!\n  </body>\n</html>\n');
      sinon.assert.calledWithExactly(makeFile.getCall(6), 'test/frontend/public/500.html', '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>500 Internal Server Error · GlideLite</title>\n  </head>\n  <body>\n    Internal Server Error!\n  </body>\n</html>\n');
    }
    sinon.assert.calledOnceWithExactly(consoleLog, "Created a new GlideLite project at: 'test'.");
  });
});
