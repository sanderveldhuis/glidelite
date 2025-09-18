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

  it('validate validating the project', () => {
    validate('input');

    sinon.assert.calledOnceWithExactly(validateWorkers, 'input');
  });

  it('validate cleaning the project', () => {
    clean('output');

    sinon.assert.calledOnceWithExactly(cleanWorkers, 'output');
  });

  it('validate compiling the project', () => {
    compile('input', 'output');

    sinon.assert.calledOnceWithExactly(compileWorkers, 'input', 'output');
  });
});
