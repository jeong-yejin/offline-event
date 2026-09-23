import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* ngrok 무료 플랜은 재시작마다 서브도메인이 바뀐다. 선행 점은 그 도메인의 모든
   서브도메인을 뜻하므로 터널 URL이 바뀌어도 설정을 다시 고치지 않는다. */
export default defineConfig({
  /* The Spline runtime decides a URL is a scene by its `.splinecode` ending, so the file travels as an
     asset and keeps that extension through the build. */
  assetsInclude: ['**/*.splinecode'],
  plugins: [react()],
  server: { allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.io'] },
});
