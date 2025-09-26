import 'mocha';
import { expect } from 'chai';
import { version } from '../../src/compiler/version';

describe('version.ts', () => {
  it('validate the version variable', () => {
    expect(version).to.equal('1.0.0');
  });
});
