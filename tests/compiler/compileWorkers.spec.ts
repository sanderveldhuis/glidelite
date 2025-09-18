import 'mocha';
import {
  clean,
  compile,
  validate
} from '../../src/compiler/compileWorkers';

describe('compileWorkers.ts', () => {
  it('validate checking the workers', () => {
    validate({ name: 'cfg' }, { name: 'cfg' }, 'input');
  });

  it('validate cleaning the workers', () => {
    clean({ name: 'cfg' }, { name: 'cfg' }, 'output');
  });

  it('validate compiling the workers', () => {
    compile({ name: 'cfg' }, { name: 'cfg' }, 'input', 'output');
  });
});
