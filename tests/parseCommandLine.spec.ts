import 'mocha';
import {
  assert,
  expect
} from 'chai';
import sinon from 'ts-sinon';
import { parseCommandLine } from '../src/parseCommandLine';

describe('parseCommandLine.ts', () => {
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
    const consoleStub1 = sinon.stub(console, 'error');
    const processStub1 = sinon.stub(process, 'exit');
    const command1 = parseCommandLine(['-']);
    consoleStub1.restore();
    processStub1.restore();

    expect(Object.keys(command1.options).length).to.equal(0);
    expect(command1.paths.length).to.equal(0);
    assert(consoleStub1.calledWith('error GL1001:', "Unknown compiler option '-'."));
    assert(processStub1.calledWith(1001));

    const consoleStub2 = sinon.stub(console, 'error');
    const processStub2 = sinon.stub(process, 'exit');
    const command2 = parseCommandLine(['--']);
    consoleStub2.restore();
    processStub2.restore();

    expect(Object.keys(command2.options).length).to.equal(0);
    expect(command2.paths.length).to.equal(0);
    assert(consoleStub2.calledWith('error GL1001:', "Unknown compiler option '--'."));
    assert(processStub2.calledWith(1001));

    const consoleStub3 = sinon.stub(console, 'error');
    const processStub3 = sinon.stub(process, 'exit');
    const command3 = parseCommandLine(['-helps']);
    consoleStub3.restore();
    processStub3.restore();

    expect(Object.keys(command3.options).length).to.equal(0);
    expect(command3.paths.length).to.equal(0);
    assert(consoleStub3.calledWith('error GL1001:', "Unknown compiler option '-helps'."));
    assert(processStub3.calledWith(1001));

    const consoleStub4 = sinon.stub(console, 'error');
    const processStub4 = sinon.stub(process, 'exit');
    const command4 = parseCommandLine(['--helps']);
    consoleStub4.restore();
    processStub4.restore();

    expect(Object.keys(command4.options).length).to.equal(0);
    expect(command4.paths.length).to.equal(0);
    assert(consoleStub4.calledWith('error GL1001:', "Unknown compiler option '--helps'."));
    assert(processStub4.calledWith(1001));

    const consoleStub5 = sinon.stub(console, 'error');
    const processStub5 = sinon.stub(process, 'exit');
    const command5 = parseCommandLine(['-hel']);
    consoleStub5.restore();
    processStub5.restore();

    expect(Object.keys(command5.options).length).to.equal(0);
    expect(command5.paths.length).to.equal(0);
    assert(consoleStub5.calledWith('error GL1001:', "Unknown compiler option '-hel'."));
    assert(processStub5.calledWith(1001));

    const consoleStub6 = sinon.stub(console, 'error');
    const processStub6 = sinon.stub(process, 'exit');
    const command6 = parseCommandLine(['--hel']);
    consoleStub6.restore();
    processStub6.restore();

    expect(Object.keys(command6.options).length).to.equal(0);
    expect(command6.paths.length).to.equal(0);
    assert(consoleStub6.calledWith('error GL1001:', "Unknown compiler option '--hel'."));
    assert(processStub6.calledWith(1001));
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
    const consoleStub1 = sinon.stub(console, 'error');
    const processStub1 = sinon.stub(process, 'exit');
    const command1 = parseCommandLine(['--module']);
    consoleStub1.restore();
    processStub1.restore();

    expect(Object.keys(command1.options).length).to.equal(0);
    expect(command1.paths.length).to.equal(0);
    assert(consoleStub1.calledWith('error GL1002:', "Compiler option 'module' expects an argument."));
    assert(processStub1.calledWith(1002));

    const consoleStub2 = sinon.stub(console, 'error');
    const processStub2 = sinon.stub(process, 'exit');
    const command2 = parseCommandLine(['-module']);
    consoleStub2.restore();
    processStub2.restore();

    expect(Object.keys(command2.options).length).to.equal(0);
    expect(command2.paths.length).to.equal(0);
    assert(consoleStub2.calledWith('error GL1002:', "Compiler option 'module' expects an argument."));
    assert(processStub2.calledWith(1002));

    const consoleStub3 = sinon.stub(console, 'error');
    const processStub3 = sinon.stub(process, 'exit');
    const command3 = parseCommandLine(['--m']);
    consoleStub3.restore();
    processStub3.restore();

    expect(Object.keys(command3.options).length).to.equal(0);
    expect(command3.paths.length).to.equal(0);
    assert(consoleStub3.calledWith('error GL1002:', "Compiler option 'module' expects an argument."));
    assert(processStub3.calledWith(1002));

    const consoleStub4 = sinon.stub(console, 'error');
    const processStub4 = sinon.stub(process, 'exit');
    const command4 = parseCommandLine(['-m']);
    consoleStub4.restore();
    processStub4.restore();

    expect(Object.keys(command4.options).length).to.equal(0);
    expect(command4.paths.length).to.equal(0);
    assert(consoleStub4.calledWith('error GL1002:', "Compiler option 'module' expects an argument."));
    assert(processStub4.calledWith(1002));
  });

  it('validate when a string option with invalid value is given', () => {
    const consoleStub1 = sinon.stub(console, 'error');
    const processStub1 = sinon.stub(process, 'exit');
    const command1 = parseCommandLine(['--module', 'backen']);
    consoleStub1.restore();
    processStub1.restore();

    expect(Object.keys(command1.options).length).to.equal(0);
    expect(command1.paths.length).to.equal(0);
    assert(consoleStub1.calledWith('error GL1003:', "Argument for 'module' option must be: 'workers', 'api', 'backend', 'js', 'css', 'site', 'frontend'."));
    assert(processStub1.calledWith(1003));

    const consoleStub2 = sinon.stub(console, 'error');
    const processStub2 = sinon.stub(process, 'exit');
    const command2 = parseCommandLine(['-module', 'backendd']);
    consoleStub2.restore();
    processStub2.restore();

    expect(Object.keys(command2.options).length).to.equal(0);
    expect(command2.paths.length).to.equal(0);
    assert(consoleStub2.calledWith('error GL1003:', "Argument for 'module' option must be: 'workers', 'api', 'backend', 'js', 'css', 'site', 'frontend'."));
    assert(processStub2.calledWith(1003));

    const consoleStub3 = sinon.stub(console, 'error');
    const processStub3 = sinon.stub(process, 'exit');
    const command3 = parseCommandLine(['--m', 'worker']);
    consoleStub3.restore();
    processStub3.restore();

    expect(Object.keys(command3.options).length).to.equal(0);
    expect(command3.paths.length).to.equal(0);
    assert(consoleStub3.calledWith('error GL1003:', "Argument for 'module' option must be: 'workers', 'api', 'backend', 'js', 'css', 'site', 'frontend'."));
    assert(processStub3.calledWith(1003));

    const consoleStub4 = sinon.stub(console, 'error');
    const processStub4 = sinon.stub(process, 'exit');
    const command4 = parseCommandLine(['-m', 'frontendd']);
    consoleStub4.restore();
    processStub4.restore();

    expect(Object.keys(command4.options).length).to.equal(0);
    expect(command4.paths.length).to.equal(0);
    assert(consoleStub4.calledWith('error GL1003:', "Argument for 'module' option must be: 'workers', 'api', 'backend', 'js', 'css', 'site', 'frontend'."));
    assert(processStub4.calledWith(1003));
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
