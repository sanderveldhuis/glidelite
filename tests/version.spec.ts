import 'mocha';
import { expect } from 'chai';
import { version } from '../src/version.js';

describe('version.ts', () => {
  it('validate the version variable', () => {
    expect(version).to.equal('1.0.0');
  });
});
