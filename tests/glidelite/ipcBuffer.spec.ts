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
import { IpcBuffer } from '../../src/glidelite/ipcBuffer';

describe('ipcBuffer.ts', () => {
  it('validate when no start frame is available', () => {
    // No data
    let buffer = new IpcBuffer();
    let messages = buffer.filter('');
    expect(messages.length).to.be.equal(0);
    expect(buffer.buffer).to.be.equal('');
    // No start frame
    buffer = new IpcBuffer();
    messages = buffer.filter('GLS]{"name":"msg","type":"publish"}[GLE]');
    expect(messages.length).to.be.equal(0);
    expect(buffer.buffer).to.be.equal('[GLE]');
    // Party start frame, maintained for future data
    buffer = new IpcBuffer();
    messages = buffer.filter('only some gibberish[GLS');
    expect(messages.length).to.be.equal(0);
    expect(buffer.buffer).to.be.equal('h[GLS');
    messages = buffer.filter('[invalid start');
    expect(messages.length).to.be.equal(0);
    expect(buffer.buffer).to.be.equal('start');
  });

  it('validate when a start frame is available but no end frame', () => {
    // Single start frame found
    let buffer = new IpcBuffer();
    let messages = buffer.filter('[GLS]{}[GLE');
    expect(messages.length).to.be.equal(0);
    expect(buffer.buffer).to.be.equal('[GLS]{}[GLE');
    // Single start frame found with gibberish in front
    buffer = new IpcBuffer();
    messages = buffer.filter('gibberish[GLS]{}[GLE');
    expect(messages.length).to.be.equal(0);
    expect(buffer.buffer).to.be.equal('gibberish[GLS]{}[GLE');
    // Multiple start frames found
    buffer = new IpcBuffer();
    messages = buffer.filter('[GLS]{}[GLE[GLS]{}[GLE');
    expect(messages.length).to.be.equal(0);
    expect(buffer.buffer).to.be.equal('[GLS]{}[GLE[GLS]{}[GLE');
    // Multiple start frames found with gibberish in front
    buffer = new IpcBuffer();
    messages = buffer.filter('gibberish[GLS]{}[GLEgibberish[GLS]{}[GLE');
    expect(messages.length).to.be.equal(0);
    expect(buffer.buffer).to.be.equal('gibberish[GLS]{}[GLEgibberish[GLS]{}[GLE');
  });

  it('validate when a the buffer overflows', () => {
    const buffer = new IpcBuffer();
    // First add the start header to ensure the buffer is not flushed
    let messages = buffer.filter('0[GLS]');
    // Add data to fill buffer completely
    messages = buffer.filter(Buffer.alloc(999994, '1').toString());
    expect(messages.length).to.be.equal(0);
    expect(buffer.buffer.length).to.be.equal(1000000);
    expect(buffer.buffer.substring(0, 6)).to.be.equal('0[GLS]');
    expect(buffer.buffer.charAt(999998)).to.be.equal('1');
    expect(buffer.buffer.charAt(999999)).to.be.equal('1');

    // Add 1 additional byte causing the buffer to overflow
    messages = buffer.filter('2');
    expect(messages.length).to.be.equal(0);
    expect(buffer.buffer.length).to.be.equal(1000000);
    expect(buffer.buffer.substring(0, 5)).to.be.equal('[GLS]');
    expect(buffer.buffer.charAt(999998)).to.be.equal('1');
    expect(buffer.buffer.charAt(999999)).to.be.equal('2');

    // Add 1 additional byte causing the buffer to not have a valid start frame anymore
    messages = buffer.filter('3');
    expect(messages.length).to.be.equal(0);
    expect(buffer.buffer.length).to.be.equal(1000000);
    expect(buffer.buffer.substring(0, 5)).to.be.equal('GLS]1');
    expect(buffer.buffer.charAt(999998)).to.be.equal('2');
    expect(buffer.buffer.charAt(999999)).to.be.equal('3');

    // Add 1 additional byte causing the buffer to fully flush due to missing start frame
    messages = buffer.filter('4');
    expect(messages.length).to.be.equal(0);
    expect(buffer.buffer.length).to.be.equal(5);
    expect(buffer.buffer).to.be.equal('11234');
  });

  it('validate when a start frame and end frame is available', () => {
    // Single message, no valid message
    let buffer = new IpcBuffer();
    let messages = buffer.filter('[GLS]{}[GLE]');
    expect(messages.length).to.be.equal(0);
    expect(buffer.buffer).to.be.equal('');
    // Single message, no leading or tailing data
    buffer = new IpcBuffer();
    messages = buffer.filter('[GLS]{"name":"msg","type":"publish"}[GLE]');
    expect(messages.length).to.be.equal(1);
    expect(messages[0].name).to.be.equal('msg');
    expect(messages[0].type).to.be.equal('publish');
    expect(buffer.buffer).to.be.equal('');
    // Single message, with leading and tailing data
    messages = buffer.filter('gibberish[GLS]{"name":"msg","type":"publish"}[GLE]remainder');
    expect(messages.length).to.be.equal(1);
    expect(messages[0].name).to.be.equal('msg');
    expect(messages[0].type).to.be.equal('publish');
    expect(buffer.buffer).to.be.equal('remainder');
    // Multiple messages, with leading and tailing data
    messages = buffer.filter('gibberish[GLS]{"name":"msg1","type":"publish"}[GLE]gibberish[GLS]{"name":"msg2","type":"subscribe"}[GLE]remainder');
    expect(messages.length).to.be.equal(2);
    expect(messages[0].name).to.be.equal('msg1');
    expect(messages[0].type).to.be.equal('publish');
    expect(messages[1].name).to.be.equal('msg2');
    expect(messages[1].type).to.be.equal('subscribe');
    expect(buffer.buffer).to.be.equal('remainder');
    // Validate if merging messages works
    messages = buffer.filter('a log of gibberish[GLS');
    expect(messages.length).to.equal(0);
    expect(buffer.buffer).to.be.equal('h[GLS');
    messages = buffer.filter(']{"name":"msg1","type":"indication"');
    expect(messages.length).to.equal(0);
    expect(buffer.buffer).to.be.equal('h[GLS]{"name":"msg1","type":"indication"');
    messages = buffer.filter('}[GLE]invalid[GLE]invalid2[GLS]{"name":"msg2","type":"indication"}[GLE][GLS][GLS]{"name":"msg3","type":"indication"}');
    expect(messages.length).to.equal(2);
    expect(messages[0].name).to.equal('msg1');
    expect(messages[0].type).to.equal('indication');
    expect(messages[1].name).to.equal('msg2');
    expect(messages[1].type).to.equal('indication');
    expect(buffer.buffer).to.be.equal('[GLS][GLS]{"name":"msg3","type":"indication"}');
    messages = buffer.filter('[GLE][GLS]message 4');
    expect(messages.length).to.equal(1);
    expect(messages[0].name).to.equal('msg3');
    expect(messages[0].type).to.equal('indication');
    expect(buffer.buffer).to.be.equal('[GLS]message 4');
  });
});
