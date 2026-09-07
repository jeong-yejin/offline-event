import { describe, expect, it } from 'vitest';
import { AppServerClient } from '../src/app-server-client.js';
import { runPreflight } from '../src/preflight.js';

const enabled = process.env.CODEX_ORCHESTRATOR_INTEGRATION === '1';

describe.skipIf(!enabled)('real Codex App Server integration', () => {
  it('checks account, exact model catalog, and rate limits without starting a model turn', async () => {
    const client = new AppServerClient();
    await client.connect();
    try {
      const report = await runPreflight(client);
      expect(report.codexVersion).toMatch(/codex/i);
      expect(report.rateLimitsBefore).toBeDefined();
    } finally {
      await client.close();
    }
  }, 30_000);
});
