import { describe, expect, it } from 'vitest';
import { workerSchema } from '../src/luna-worker.js';
import { parseStructuredOutput, planSchema, reviewSchema } from '../src/sol.js';

describe('structured model output parsing', () => {
  it('parses the first complete JSON object when the model appends extra text', () => {
    const parsed = parseStructuredOutput<{ ok: boolean; nested: { value: string } }>('{"ok":true,"nested":{"value":"done"}}\nThis extra note should be ignored.');

    expect(parsed).toEqual({ ok: true, nested: { value: 'done' } });
  });
});

function assertStrictObjectSchemas(schema: unknown): void {
  if (!schema || typeof schema !== 'object') return;
  const record = schema as Record<string, unknown>;
  if (record.type === 'object') expect(record.additionalProperties).toBe(false);
  for (const value of Object.values(record)) {
    if (Array.isArray(value)) value.forEach(assertStrictObjectSchemas);
    else assertStrictObjectSchemas(value);
  }
}

describe('structured output schemas', () => {
  it('marks every object schema as strict for Codex App Server structured output', () => {
    assertStrictObjectSchemas(planSchema);
    assertStrictObjectSchemas(reviewSchema);
    assertStrictObjectSchemas(workerSchema);
  });
});
