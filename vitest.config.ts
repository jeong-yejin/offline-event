import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    setupFiles: ['./test-setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'tools/codex-orchestrator/test/**/*.test.ts'],
  },
});
