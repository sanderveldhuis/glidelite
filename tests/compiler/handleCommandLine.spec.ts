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
import { handleCommandLine } from '../../src/compiler/handleCommandLine';
import * as initProjectSrc from '../../src/compiler/initProject';
import * as moduleBackendSrc from '../../src/compiler/moduleBackend';
import * as moduleFrontendSrc from '../../src/compiler/moduleFrontend';
import * as moduleProjectSrc from '../../src/compiler/moduleProject';
import * as printHelpSrc from '../../src/compiler/printHelp';
import * as printVersionSrc from '../../src/compiler/printVersion';
import * as sysUtilsSrc from '../../src/compiler/sysUtils';
import {
  Command,
  CommandOptions
} from '../../src/compiler/types';

describe('handleCommandLine.ts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validate when the version option is given', () => {
    const printVersion = vi.spyOn(printVersionSrc, 'printVersion').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});

    const options: CommandOptions = { version: true };
    const paths: string[] = [];
    const command: Command = { options, paths };
    handleCommandLine(command);
    expect(printVersion).toHaveBeenCalledTimes(1);
    expect(printVersion).toHaveBeenLastCalledWith();
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(0);
  });

  it('validate when the help option is given', () => {
    const printHelp = vi.spyOn(printHelpSrc, 'printHelp').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});

    const options: CommandOptions = { help: true };
    const paths: string[] = [];
    const command: Command = { options, paths };
    handleCommandLine(command);
    expect(printHelp).toHaveBeenCalledTimes(1);
    expect(printHelp).toHaveBeenLastCalledWith();
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(0);
  });

  it('validate when the init option is given', () => {
    const initProject = vi.spyOn(initProjectSrc, 'initProject').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});

    const options: CommandOptions = { init: true };
    const paths: string[] = [];
    const command: Command = { options, paths };
    handleCommandLine(command);
    expect(initProject).toHaveBeenCalledTimes(1);
    expect(initProject).toHaveBeenLastCalledWith(process.cwd());
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(0);
  });

  it('validate when the run option is given', () => {
    const validateProject = vi.spyOn(moduleProjectSrc, 'validate').mockImplementation(() => {/*Emtpy*/});
    const runProject = vi.spyOn(moduleProjectSrc, 'run').mockImplementation(() => {/*Emtpy*/});
    const readJsonFile = vi.spyOn(sysUtilsSrc, 'readJsonFile');

    const options: CommandOptions = { run: true };
    const paths: string[] = [];
    const command: Command = { options, paths };
    readJsonFile.mockReturnValueOnce({ name: 'pkg', version: '1.0.0' }).mockReturnValueOnce({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      expect(readJsonFile).toHaveBeenCalledTimes(2);
      expect(readJsonFile).toHaveBeenNthCalledWith(1, process.cwd() + '\\package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(2, process.cwd() + '\\glconfig.json');
    }
    else {
      expect(readJsonFile).toHaveBeenCalledTimes(2);
      expect(readJsonFile).toHaveBeenNthCalledWith(1, process.cwd() + '/package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(2, process.cwd() + '/glconfig.json');
    }
    expect(validateProject).toHaveBeenCalledTimes(1);
    expect(validateProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    expect(runProject).toHaveBeenCalledTimes(1);
    expect(runProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
  });

  it('validate when the module option is unknown', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});

    const options: CommandOptions = { module: 'other' };
    const paths: string[] = [];
    const command: Command = { options, paths };
    handleCommandLine(command);
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenLastCalledWith('error GL1003:', "Compiler for module 'other' not implemented.");
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(1003);
  });

  it('validate when the frontend module option is given', () => {
    const cleanFrontend = vi.spyOn(moduleFrontendSrc, 'clean').mockImplementation(() => {/*Emtpy*/});
    const validateFrontend = vi.spyOn(moduleFrontendSrc, 'validate').mockImplementation(() => {/*Emtpy*/});
    const compileFrontend = vi.spyOn(moduleFrontendSrc, 'compile').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const readJsonFile = vi.spyOn(sysUtilsSrc, 'readJsonFile');

    const options: CommandOptions = { module: 'frontend' };
    const paths: string[] = [];
    const command: Command = { options, paths };
    readJsonFile.mockReturnValueOnce({ name: 'pkg', version: '1.0.0' }).mockReturnValueOnce({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      expect(readJsonFile).toHaveBeenCalledTimes(2);
      expect(readJsonFile).toHaveBeenNthCalledWith(1, process.cwd() + '\\package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(2, process.cwd() + '\\glconfig.json');
      expect(compileFrontend).toHaveBeenCalledTimes(1);
      expect(compileFrontend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      expect(readJsonFile).toHaveBeenCalledTimes(2);
      expect(readJsonFile).toHaveBeenNthCalledWith(1, process.cwd() + '/package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(2, process.cwd() + '/glconfig.json');
      expect(compileFrontend).toHaveBeenCalledTimes(1);
      expect(compileFrontend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/output');
    }
    expect(validateFrontend).toHaveBeenCalledTimes(1);
    expect(validateFrontend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(0);

    options.clean = false;
    readJsonFile.mockReturnValueOnce({ name: 'pkg', version: '1.0.0' }).mockReturnValueOnce({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      expect(readJsonFile).toHaveBeenCalledTimes(4);
      expect(readJsonFile).toHaveBeenNthCalledWith(3, process.cwd() + '\\package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(4, process.cwd() + '\\glconfig.json');
      expect(compileFrontend).toHaveBeenCalledTimes(2);
      expect(compileFrontend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      expect(readJsonFile).toHaveBeenCalledTimes(4);
      expect(readJsonFile).toHaveBeenNthCalledWith(3, process.cwd() + '/package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(4, process.cwd() + '/glconfig.json');
      expect(compileFrontend).toHaveBeenCalledTimes(2);
      expect(compileFrontend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/output');
    }
    expect(validateFrontend).toHaveBeenCalledTimes(2);
    expect(validateFrontend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    expect(processExit).toHaveBeenCalledTimes(2);
    expect(processExit).toHaveBeenLastCalledWith(0);

    options.clean = true;
    readJsonFile.mockReturnValueOnce({ name: 'pkg', version: '1.0.0' }).mockReturnValueOnce({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      expect(readJsonFile).toHaveBeenCalledTimes(6);
      expect(readJsonFile).toHaveBeenNthCalledWith(5, process.cwd() + '\\package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(6, process.cwd() + '\\glconfig.json');
      expect(cleanFrontend).toHaveBeenCalledTimes(1);
      expect(cleanFrontend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd() + '\\output');
      expect(compileFrontend).toHaveBeenCalledTimes(3);
      expect(compileFrontend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      expect(readJsonFile).toHaveBeenCalledTimes(6);
      expect(readJsonFile).toHaveBeenNthCalledWith(5, process.cwd() + '/package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(6, process.cwd() + '/glconfig.json');
      expect(cleanFrontend).toHaveBeenCalledTimes(1);
      expect(cleanFrontend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd() + '/output');
      expect(compileFrontend).toHaveBeenCalledTimes(3);
      expect(compileFrontend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/output');
    }
    expect(validateFrontend).toHaveBeenCalledTimes(3);
    expect(validateFrontend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    expect(processExit).toHaveBeenCalledTimes(3);
    expect(processExit).toHaveBeenLastCalledWith(0);

    options.clean = false;
    options.outdir = 'hello/../world';
    readJsonFile.mockReturnValueOnce({ name: 'pkg', version: '1.0.0' }).mockReturnValueOnce({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      expect(readJsonFile).toHaveBeenCalledTimes(8);
      expect(readJsonFile).toHaveBeenNthCalledWith(7, process.cwd() + '\\package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(8, process.cwd() + '\\glconfig.json');
      expect(compileFrontend).toHaveBeenCalledTimes(4);
      expect(compileFrontend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\world');
    }
    else {
      expect(readJsonFile).toHaveBeenCalledTimes(8);
      expect(readJsonFile).toHaveBeenNthCalledWith(7, process.cwd() + '/package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(8, process.cwd() + '/glconfig.json');
      expect(compileFrontend).toHaveBeenCalledTimes(4);
      expect(compileFrontend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/world');
    }
    expect(validateFrontend).toHaveBeenCalledTimes(4);
    expect(validateFrontend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    expect(processExit).toHaveBeenCalledTimes(4);
    expect(processExit).toHaveBeenLastCalledWith(0);
  });

  it('validate when the backend module option is given', () => {
    const cleanBackend = vi.spyOn(moduleBackendSrc, 'clean').mockImplementation(() => {/*Emtpy*/});
    const validateBackend = vi.spyOn(moduleBackendSrc, 'validate').mockImplementation(() => {/*Emtpy*/});
    const compileBackend = vi.spyOn(moduleBackendSrc, 'compile').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const readJsonFile = vi.spyOn(sysUtilsSrc, 'readJsonFile');

    const options: CommandOptions = { module: 'backend' };
    const paths: string[] = [];
    const command: Command = { options, paths };
    readJsonFile.mockReturnValueOnce({ name: 'pkg', version: '1.0.0' }).mockReturnValueOnce({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      expect(readJsonFile).toHaveBeenCalledTimes(2);
      expect(readJsonFile).toHaveBeenNthCalledWith(1, process.cwd() + '\\package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(2, process.cwd() + '\\glconfig.json');
      expect(compileBackend).toHaveBeenCalledTimes(1);
      expect(compileBackend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      expect(readJsonFile).toHaveBeenCalledTimes(2);
      expect(readJsonFile).toHaveBeenNthCalledWith(1, process.cwd() + '/package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(2, process.cwd() + '/glconfig.json');
      expect(compileBackend).toHaveBeenCalledTimes(1);
      expect(compileBackend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/output');
    }
    expect(validateBackend).toHaveBeenCalledTimes(1);
    expect(validateBackend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(0);

    options.clean = false;
    readJsonFile.mockReturnValueOnce({ name: 'pkg', version: '1.0.0' }).mockReturnValueOnce({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      expect(readJsonFile).toHaveBeenCalledTimes(4);
      expect(readJsonFile).toHaveBeenNthCalledWith(3, process.cwd() + '\\package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(4, process.cwd() + '\\glconfig.json');
      expect(compileBackend).toHaveBeenCalledTimes(2);
      expect(compileBackend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      expect(readJsonFile).toHaveBeenCalledTimes(4);
      expect(readJsonFile).toHaveBeenNthCalledWith(3, process.cwd() + '/package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(4, process.cwd() + '/glconfig.json');
      expect(compileBackend).toHaveBeenCalledTimes(2);
      expect(compileBackend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/output');
    }
    expect(validateBackend).toHaveBeenCalledTimes(2);
    expect(validateBackend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    expect(processExit).toHaveBeenCalledTimes(2);
    expect(processExit).toHaveBeenLastCalledWith(0);

    options.clean = true;
    readJsonFile.mockReturnValueOnce({ name: 'pkg', version: '1.0.0' }).mockReturnValueOnce({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      expect(readJsonFile).toHaveBeenCalledTimes(6);
      expect(readJsonFile).toHaveBeenNthCalledWith(5, process.cwd() + '\\package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(6, process.cwd() + '\\glconfig.json');
      expect(cleanBackend).toHaveBeenCalledTimes(1);
      expect(cleanBackend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd() + '\\output');
      expect(compileBackend).toHaveBeenCalledTimes(3);
      expect(compileBackend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      expect(readJsonFile).toHaveBeenCalledTimes(6);
      expect(readJsonFile).toHaveBeenNthCalledWith(5, process.cwd() + '/package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(6, process.cwd() + '/glconfig.json');
      expect(cleanBackend).toHaveBeenCalledTimes(1);
      expect(cleanBackend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd() + '/output');
      expect(compileBackend).toHaveBeenCalledTimes(3);
      expect(compileBackend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/output');
    }
    expect(validateBackend).toHaveBeenCalledTimes(3);
    expect(validateBackend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    expect(processExit).toHaveBeenCalledTimes(3);
    expect(processExit).toHaveBeenLastCalledWith(0);

    options.clean = false;
    options.outdir = 'hello/../world';
    readJsonFile.mockReturnValueOnce({ name: 'pkg', version: '1.0.0' }).mockReturnValueOnce({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      expect(readJsonFile).toHaveBeenCalledTimes(8);
      expect(readJsonFile).toHaveBeenNthCalledWith(7, process.cwd() + '\\package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(8, process.cwd() + '\\glconfig.json');
      expect(compileBackend).toHaveBeenCalledTimes(4);
      expect(compileBackend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\world');
    }
    else {
      expect(readJsonFile).toHaveBeenCalledTimes(8);
      expect(readJsonFile).toHaveBeenNthCalledWith(7, process.cwd() + '/package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(8, process.cwd() + '/glconfig.json');
      expect(compileBackend).toHaveBeenCalledTimes(4);
      expect(compileBackend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/world');
    }
    expect(validateBackend).toHaveBeenCalledTimes(4);
    expect(validateBackend).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    expect(processExit).toHaveBeenCalledTimes(4);
    expect(processExit).toHaveBeenLastCalledWith(0);
  });

  it('validate when no options are given', () => {
    const cleanProject = vi.spyOn(moduleProjectSrc, 'clean').mockImplementation(() => {/*Emtpy*/});
    const validateProject = vi.spyOn(moduleProjectSrc, 'validate').mockImplementation(() => {/*Emtpy*/});
    const compileProject = vi.spyOn(moduleProjectSrc, 'compile').mockImplementation(() => {/*Emtpy*/});
    // @ts-expect-error because function has return type never
    const processExit = vi.spyOn(process, 'exit').mockImplementation(() => {/*Emtpy*/});
    const readJsonFile = vi.spyOn(sysUtilsSrc, 'readJsonFile');

    const options = {} as CommandOptions;
    const paths: string[] = [];
    const command: Command = { options, paths };
    readJsonFile.mockReturnValueOnce({ name: 'pkg', version: '1.0.0' }).mockReturnValueOnce({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      expect(readJsonFile).toHaveBeenCalledTimes(2);
      expect(readJsonFile).toHaveBeenNthCalledWith(1, process.cwd() + '\\package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(2, process.cwd() + '\\glconfig.json');
      expect(compileProject).toHaveBeenCalledTimes(1);
      expect(compileProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      expect(readJsonFile).toHaveBeenCalledTimes(2);
      expect(readJsonFile).toHaveBeenNthCalledWith(1, process.cwd() + '/package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(2, process.cwd() + '/glconfig.json');
      expect(compileProject).toHaveBeenCalledTimes(1);
      expect(compileProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd(), process.cwd() + '/output');
    }
    expect(validateProject).toHaveBeenCalledTimes(1);
    expect(validateProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'cfg', version: '1.0.0' }, process.cwd());
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenLastCalledWith(0);

    options.clean = false;
    readJsonFile.mockReturnValueOnce({ name: 'pkg', version: '1.0.0', homepage: 'https://example1.com' }).mockReturnValueOnce({ name: 'cfg', homepage: 'https://example2.com' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      expect(readJsonFile).toHaveBeenCalledTimes(4);
      expect(readJsonFile).toHaveBeenNthCalledWith(3, process.cwd() + '\\package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(4, process.cwd() + '\\glconfig.json');
      expect(compileProject).toHaveBeenCalledTimes(2);
      expect(compileProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0', homepage: 'https://example1.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example2.com' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      expect(readJsonFile).toHaveBeenCalledTimes(4);
      expect(readJsonFile).toHaveBeenNthCalledWith(3, process.cwd() + '/package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(4, process.cwd() + '/glconfig.json');
      expect(compileProject).toHaveBeenCalledTimes(2);
      expect(compileProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0', homepage: 'https://example1.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example2.com' }, process.cwd(), process.cwd() + '/output');
    }
    expect(validateProject).toHaveBeenCalledTimes(2);
    expect(validateProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0', homepage: 'https://example1.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example2.com' }, process.cwd());
    expect(processExit).toHaveBeenCalledTimes(2);
    expect(processExit).toHaveBeenLastCalledWith(0);

    options.clean = true;
    readJsonFile.mockReturnValueOnce({ name: 'pkg', version: '1.0.0', homepage: 'https://example.com' }).mockReturnValueOnce({ name: 'cfg' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      expect(readJsonFile).toHaveBeenCalledTimes(6);
      expect(readJsonFile).toHaveBeenNthCalledWith(5, process.cwd() + '\\package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(6, process.cwd() + '\\glconfig.json');
      expect(cleanProject).toHaveBeenCalledTimes(1);
      expect(cleanProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0', homepage: 'https://example.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example.com' }, process.cwd() + '\\output');
      expect(compileProject).toHaveBeenCalledTimes(3);
      expect(compileProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0', homepage: 'https://example.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example.com' }, process.cwd(), process.cwd() + '\\output');
    }
    else {
      expect(readJsonFile).toHaveBeenCalledTimes(6);
      expect(readJsonFile).toHaveBeenNthCalledWith(5, process.cwd() + '/package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(6, process.cwd() + '/glconfig.json');
      expect(cleanProject).toHaveBeenCalledTimes(1);
      expect(cleanProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0', homepage: 'https://example.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example.com' }, process.cwd() + '/output');
      expect(compileProject).toHaveBeenCalledTimes(3);
      expect(compileProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0', homepage: 'https://example.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example.com' }, process.cwd(), process.cwd() + '/output');
    }
    expect(validateProject).toHaveBeenCalledTimes(3);
    expect(validateProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0', homepage: 'https://example.com' }, { name: 'cfg', version: '1.0.0', homepage: 'https://example.com' }, process.cwd());
    expect(processExit).toHaveBeenCalledTimes(3);
    expect(processExit).toHaveBeenLastCalledWith(0);

    options.clean = false;
    options.outdir = 'hello/../world';
    readJsonFile.mockReturnValueOnce({ name: 'pkg', version: '1.0.0' }).mockReturnValueOnce({ version: '1.0.1', homepage: 'https://example.com' });
    handleCommandLine(command);
    if ('win32' === process.platform) {
      expect(readJsonFile).toHaveBeenCalledTimes(8);
      expect(readJsonFile).toHaveBeenNthCalledWith(7, process.cwd() + '\\package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(8, process.cwd() + '\\glconfig.json');
      expect(compileProject).toHaveBeenCalledTimes(4);
      expect(compileProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'pkg', version: '1.0.1', homepage: 'https://example.com' }, process.cwd(), process.cwd() + '\\world');
    }
    else {
      expect(readJsonFile).toHaveBeenCalledTimes(8);
      expect(readJsonFile).toHaveBeenNthCalledWith(7, process.cwd() + '/package.json');
      expect(readJsonFile).toHaveBeenNthCalledWith(8, process.cwd() + '/glconfig.json');
      expect(compileProject).toHaveBeenCalledTimes(4);
      expect(compileProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'pkg', version: '1.0.1', homepage: 'https://example.com' }, process.cwd(), process.cwd() + '/world');
    }
    expect(validateProject).toHaveBeenCalledTimes(4);
    expect(validateProject).toHaveBeenLastCalledWith({ name: 'pkg', version: '1.0.0' }, { name: 'pkg', version: '1.0.1', homepage: 'https://example.com' }, process.cwd());
    expect(processExit).toHaveBeenCalledTimes(4);
    expect(processExit).toHaveBeenLastCalledWith(0);
  });
});
