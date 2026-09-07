import { describe, expect, it } from 'vitest';
import { assertPreflight, requiredModelIds } from '../src/preflight.js';

describe('preflight gates', () => {
  it('requires the exact Sol and Luna model ids', () => {
    expect(requiredModelIds).toEqual(['gpt-5.6-sol', 'gpt-5.6-luna']);
    expect(() => assertPreflight({
      codexVersion: 'codex-cli 0.140.0',
      account: { type: 'chatgpt', planType: 'pro', email: 'user@example.com' },
      models: [{ id: 'gpt-5.6-sol', supportedReasoningEfforts: ['max'] }],
    })).toThrow(/gpt-5\.6-luna/);
  });

  it('rejects API-key auth and tells the user how to switch', () => {
    expect(() => assertPreflight({
      codexVersion: 'codex-cli 0.140.0',
      account: { type: 'apiKey' },
      models: [
        { id: 'gpt-5.6-sol', supportedReasoningEfforts: ['max'] },
        { id: 'gpt-5.6-luna', supportedReasoningEfforts: ['low'] },
      ],
    })).toThrow(/chatgptDeviceCode/i);
  });

  it('uses an explicitly requested ChatGPT model and effort without substituting hidden defaults', () => {
    const report = assertPreflight({
      codexVersion: 'codex-cli 0.140.0',
      account: { type: 'chatgpt', planType: 'plus', email: 'user@example.com' },
      models: [{ id: 'gpt-5.5', supportedReasoningEfforts: ['low', 'medium', 'high', 'xhigh'] }],
    }, { model: 'gpt-5.5', effort: 'high' });

    expect(report.sol.id).toBe('gpt-5.5');
    expect(report.luna.id).toBe('gpt-5.5');
    expect(report.solReasoningEffort).toBe('high');
    expect(report.lunaReasoningEffort).toBe('high');
    expect(report.notices).toContain('Explicit model override active: Sol and Luna roles will both run on gpt-5.5 with reasoning effort high.');
  });

  it('rejects an explicit effort that the requested model does not advertise', () => {
    expect(() => assertPreflight({
      codexVersion: 'codex-cli 0.140.0',
      account: { type: 'chatgpt', planType: 'plus', email: 'user@example.com' },
      models: [{ id: 'gpt-5.5', supportedReasoningEfforts: ['low', 'medium'] }],
    }, { model: 'gpt-5.5', effort: 'high' })).toThrow(/does not support reasoning effort high/i);
  });
});
