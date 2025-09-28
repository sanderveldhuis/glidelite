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

import { expect } from 'chai';
import sinon from 'ts-sinon';
import { parseCommandLine } from '../../src/compiler/parseCommandLine';

describe('parseCommandLine.ts', () => {
  let consoleError: sinon.SinonStub;
  let processExit: sinon.SinonStub;

  beforeEach(() => {
    consoleError = sinon.stub(console, 'error');
    processExit = sinon.stub(process, 'exit');
  });

  afterEach(() => {
    consoleError.restore();
    processExit.restore();
  });

  it('validate when no parameters are given', () => {
    const command = parseCommandLine([]);

    expect(Object.keys(command.options).length).to.equal(0);
    expect(command.paths.length).to.equal(0);
  });

  it('validate when only paths are given', () => {
    const command = parseCommandLine(['hello', 'world']);

    expect(Object.keys(command.options).length).to.equal(0);
    expect(command.paths.length).to.equal(2);
    expect(command.paths[0]).to.equal('hello');
    expect(command.paths[1]).to.equal('world');
  });

  it('validate when an unknown option is given', () => {
    const command1 = parseCommandLine(['-']);

    expect(command1).to.equal(undefined);
    sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL1001:', "Unknown compiler option '-'.");
    sinon.assert.calledWithExactly(processExit.getCall(0), 1001);

    const command2 = parseCommandLine(['--']);

    expect(command2).to.equal(undefined);
    sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL1001:', "Unknown compiler option '--'.");
    sinon.assert.calledWithExactly(processExit.getCall(1), 1001);

    const command3 = parseCommandLine(['-helps']);

    expect(command3).to.equal(undefined);
    sinon.assert.calledWithExactly(consoleError.getCall(2), 'error GL1001:', "Unknown compiler option '-helps'.");
    sinon.assert.calledWithExactly(processExit.getCall(2), 1001);

    const command4 = parseCommandLine(['--helps']);

    expect(command4).to.equal(undefined);
    sinon.assert.calledWithExactly(consoleError.getCall(3), 'error GL1001:', "Unknown compiler option '--helps'.");
    sinon.assert.calledWithExactly(processExit.getCall(3), 1001);

    const command5 = parseCommandLine(['-hel']);

    expect(command5).to.equal(undefined);
    sinon.assert.calledWithExactly(consoleError.getCall(4), 'error GL1001:', "Unknown compiler option '-hel'.");
    sinon.assert.calledWithExactly(processExit.getCall(4), 1001);

    const command6 = parseCommandLine(['--hel']);

    expect(command6).to.equal(undefined);
    sinon.assert.calledWithExactly(consoleError.getCall(5), 'error GL1001:', "Unknown compiler option '--hel'.");
    sinon.assert.calledWithExactly(processExit.getCall(5), 1001);
  });

  it('validate when a boolean option is given', () => {
    const command1 = parseCommandLine(['--help']);

    expect(Object.keys(command1.options).length).to.equal(1);
    expect(command1.options.help).to.equal(true);
    expect(command1.paths.length).to.equal(0);

    const command2 = parseCommandLine(['-help']);

    expect(Object.keys(command2.options).length).to.equal(1);
    expect(command2.options.help).to.equal(true);
    expect(command2.paths.length).to.equal(0);

    const command3 = parseCommandLine(['--h']);

    expect(Object.keys(command3.options).length).to.equal(1);
    expect(command3.options.help).to.equal(true);
    expect(command3.paths.length).to.equal(0);

    const command4 = parseCommandLine(['-h']);

    expect(Object.keys(command4.options).length).to.equal(1);
    expect(command4.options.help).to.equal(true);
    expect(command4.paths.length).to.equal(0);

    const command5 = parseCommandLine(['--help', 'true']);

    expect(Object.keys(command5.options).length).to.equal(1);
    expect(command5.options.help).to.equal(true);
    expect(command5.paths.length).to.equal(0);

    const command6 = parseCommandLine(['--help', 'false']);

    expect(Object.keys(command6.options).length).to.equal(1);
    expect(command6.options.help).to.equal(false);
    expect(command6.paths.length).to.equal(0);

    const command7 = parseCommandLine(['-help', 'true']);

    expect(Object.keys(command7.options).length).to.equal(1);
    expect(command7.options.help).to.equal(true);
    expect(command7.paths.length).to.equal(0);

    const command8 = parseCommandLine(['-help', 'false']);

    expect(Object.keys(command8.options).length).to.equal(1);
    expect(command8.options.help).to.equal(false);
    expect(command8.paths.length).to.equal(0);

    const command9 = parseCommandLine(['--h', 'true']);

    expect(Object.keys(command9.options).length).to.equal(1);
    expect(command9.options.help).to.equal(true);
    expect(command9.paths.length).to.equal(0);

    const command10 = parseCommandLine(['--h', 'false']);

    expect(Object.keys(command10.options).length).to.equal(1);
    expect(command10.options.help).to.equal(false);
    expect(command10.paths.length).to.equal(0);

    const command11 = parseCommandLine(['-h', 'true']);

    expect(Object.keys(command11.options).length).to.equal(1);
    expect(command11.options.help).to.equal(true);
    expect(command11.paths.length).to.equal(0);

    const command12 = parseCommandLine(['-h', 'false']);

    expect(Object.keys(command12.options).length).to.equal(1);
    expect(command12.options.help).to.equal(false);
    expect(command12.paths.length).to.equal(0);
  });

  it('validate when a string option without value is given', () => {
    const command1 = parseCommandLine(['--module']);

    expect(Object.keys(command1.options).length).to.equal(0);
    expect(command1.paths.length).to.equal(0);
    sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL1002:', "Compiler option 'module' expects an argument.");
    sinon.assert.calledWithExactly(processExit.getCall(0), 1002);

    const command2 = parseCommandLine(['-module']);

    expect(Object.keys(command2.options).length).to.equal(0);
    expect(command2.paths.length).to.equal(0);
    sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL1002:', "Compiler option 'module' expects an argument.");
    sinon.assert.calledWithExactly(processExit.getCall(1), 1002);

    const command3 = parseCommandLine(['--m']);

    expect(Object.keys(command3.options).length).to.equal(0);
    expect(command3.paths.length).to.equal(0);
    sinon.assert.calledWithExactly(consoleError.getCall(2), 'error GL1002:', "Compiler option 'module' expects an argument.");
    sinon.assert.calledWithExactly(processExit.getCall(2), 1002);

    const command4 = parseCommandLine(['-m']);

    expect(Object.keys(command4.options).length).to.equal(0);
    expect(command4.paths.length).to.equal(0);
    sinon.assert.calledWithExactly(consoleError.getCall(3), 'error GL1002:', "Compiler option 'module' expects an argument.");
    sinon.assert.calledWithExactly(processExit.getCall(3), 1002);
  });

  it('validate when a string option with invalid value is given', () => {
    const command1 = parseCommandLine(['--module', 'backen']);

    expect(Object.keys(command1.options).length).to.equal(0);
    expect(command1.paths.length).to.equal(0);
    sinon.assert.calledWithExactly(consoleError.getCall(0), 'error GL1003:', "Argument for 'module' option must be: 'workers', 'api', 'backend', 'js', 'css', 'site', 'frontend'.");
    sinon.assert.calledWithExactly(processExit.getCall(0), 1003);

    const command2 = parseCommandLine(['-module', 'backendd']);

    expect(Object.keys(command2.options).length).to.equal(0);
    expect(command2.paths.length).to.equal(0);
    sinon.assert.calledWithExactly(consoleError.getCall(1), 'error GL1003:', "Argument for 'module' option must be: 'workers', 'api', 'backend', 'js', 'css', 'site', 'frontend'.");
    sinon.assert.calledWithExactly(processExit.getCall(1), 1003);

    const command3 = parseCommandLine(['--m', 'worker']);

    expect(Object.keys(command3.options).length).to.equal(0);
    expect(command3.paths.length).to.equal(0);
    sinon.assert.calledWithExactly(consoleError.getCall(2), 'error GL1003:', "Argument for 'module' option must be: 'workers', 'api', 'backend', 'js', 'css', 'site', 'frontend'.");
    sinon.assert.calledWithExactly(processExit.getCall(2), 1003);

    const command4 = parseCommandLine(['-m', 'frontendd']);

    expect(Object.keys(command4.options).length).to.equal(0);
    expect(command4.paths.length).to.equal(0);
    sinon.assert.calledWithExactly(consoleError.getCall(3), 'error GL1003:', "Argument for 'module' option must be: 'workers', 'api', 'backend', 'js', 'css', 'site', 'frontend'.");
    sinon.assert.calledWithExactly(processExit.getCall(3), 1003);
  });

  it('validate when a string option with valid value is given', () => {
    const command1 = parseCommandLine(['--module', 'workers']);

    expect(Object.keys(command1.options).length).to.equal(1);
    expect(command1.options.module).to.equal('workers');
    expect(command1.paths.length).to.equal(0);

    const command2 = parseCommandLine(['-module', 'workers']);

    expect(Object.keys(command2.options).length).to.equal(1);
    expect(command2.options.module).to.equal('workers');
    expect(command2.paths.length).to.equal(0);

    const command3 = parseCommandLine(['--m', 'workers']);

    expect(Object.keys(command3.options).length).to.equal(1);
    expect(command3.options.module).to.equal('workers');
    expect(command3.paths.length).to.equal(0);

    const command4 = parseCommandLine(['-m', 'workers']);

    expect(Object.keys(command4.options).length).to.equal(1);
    expect(command4.options.module).to.equal('workers');
    expect(command4.paths.length).to.equal(0);
  });

  it('validate when all options are given', () => {
    const command1 = parseCommandLine(['--help', '--version', '--init', '--clean', '--module', 'workers', '--outDir', 'output', 'world', 'universe']);

    expect(Object.keys(command1.options).length).to.equal(6);
    expect(command1.options.help).to.equal(true);
    expect(command1.options.version).to.equal(true);
    expect(command1.options.init).to.equal(true);
    expect(command1.options.clean).to.equal(true);
    expect(command1.options.outdir).to.equal('output');
    expect(command1.options.module).to.equal('workers');
    expect(command1.paths.length).to.equal(2);
    expect(command1.paths[0]).to.equal('world');
    expect(command1.paths[1]).to.equal('universe');

    const command2 = parseCommandLine(['world', '--help', 'universe', '--version', '--init', 'false', '--clean', '--module', 'workers', '--outDir', 'output', 'multiverse']);

    expect(Object.keys(command1.options).length).to.equal(6);
    expect(command2.options.help).to.equal(true);
    expect(command2.options.version).to.equal(true);
    expect(command2.options.init).to.equal(false);
    expect(command2.options.clean).to.equal(true);
    expect(command2.options.outdir).to.equal('output');
    expect(command2.options.module).to.equal('workers');
    expect(command2.paths.length).to.equal(3);
    expect(command2.paths[0]).to.equal('world');
    expect(command2.paths[1]).to.equal('universe');
    expect(command2.paths[2]).to.equal('multiverse');

    const command3 = parseCommandLine(['world', '-h', 'universe', '-v', '-i', 'false', '-c', '-m', 'workers', '-o', 'output', 'multiverse']);

    expect(Object.keys(command1.options).length).to.equal(6);
    expect(command3.options.help).to.equal(true);
    expect(command3.options.version).to.equal(true);
    expect(command3.options.init).to.equal(false);
    expect(command3.options.clean).to.equal(true);
    expect(command3.options.outdir).to.equal('output');
    expect(command3.options.module).to.equal('workers');
    expect(command3.paths.length).to.equal(3);
    expect(command3.paths[0]).to.equal('world');
    expect(command3.paths[1]).to.equal('universe');
    expect(command3.paths[2]).to.equal('multiverse');
  });
});
