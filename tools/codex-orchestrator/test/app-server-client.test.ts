import { describe, expect, it } from 'vitest';
import { parseJsonRpcLine } from '../src/app-server-client.js';

describe('JSON-RPC line protocol', () => {
  it('parses responses and ignores blank lines', () => {
    expect(parseJsonRpcLine('')).toBeNull();
    expect(parseJsonRpcLine('{"id":1,"result":{"ok":true}}')).toEqual({
      id: 1,
      result: { ok: true },
    });
  });

  it('rejects malformed JSON with a useful error', () => {
    expect(() => parseJsonRpcLine('{bad')).toThrow(/invalid JSON-RPC line/i);
  });
});
