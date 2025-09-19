import 'mocha';
import { expect } from 'chai';
import { glconfig } from '../../src/glidelite/glidelite';

describe('glidelite.ts', () => {
  it('validate the GlideLite config', () => {
    expect(glconfig).to.deep.equal({
      comment1: "this file is used by the unittest 'tests/glidelite/glidelite.spec.ts'",
      comment2: 'do not remove this file'
    });
  });
});
