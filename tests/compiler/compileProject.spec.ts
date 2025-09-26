import 'mocha';
import sinon from 'ts-sinon';
import {
  clean,
  compile,
  validate
} from '../../src/compiler/compileProject';
import * as compileWorkersSrc from '../../src/compiler/compileWorkers';

describe('compileProject.ts', () => {
  let cleanWorkers: sinon.SinonStub;
  let compileWorkers: sinon.SinonStub;
  let validateWorkers: sinon.SinonStub;

  beforeEach(() => {
    cleanWorkers = sinon.stub(compileWorkersSrc, 'clean');
    compileWorkers = sinon.stub(compileWorkersSrc, 'compile');
    validateWorkers = sinon.stub(compileWorkersSrc, 'validate');
  });

  afterEach(() => {
    cleanWorkers.restore();
    compileWorkers.restore();
    validateWorkers.restore();
  });

  it('validate checking the project', () => {
    validate({ name: 'cfg' }, { name: 'cfg' }, 'input');

    sinon.assert.calledOnceWithExactly(validateWorkers, { name: 'cfg' }, { name: 'cfg' }, 'input');
  });

  it('validate cleaning the project', () => {
    clean({ name: 'cfg' }, { name: 'cfg' }, 'output');

    sinon.assert.calledOnceWithExactly(cleanWorkers, { name: 'cfg' }, { name: 'cfg' }, 'output');
  });

  it('validate compiling the project', () => {
    compile({ name: 'cfg' }, { name: 'cfg' }, 'input', 'output');

    sinon.assert.calledOnceWithExactly(compileWorkers, { name: 'cfg' }, { name: 'cfg' }, 'input', 'output');
  });
});
