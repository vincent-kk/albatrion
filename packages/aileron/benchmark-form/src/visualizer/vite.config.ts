import react from '@vitejs/plugin-react';
import fs from 'fs';
import type { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import type { Connect, ViteDevServer } from 'vite';
import { defineConfig } from 'vite';

// results 디렉토리의 파일 목록을 제공하는 미들웨어
function resultsMiddleware() {
  return {
    name: 'results-middleware',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        '/api/results',
        (_req: IncomingMessage, res: ServerResponse) => {
          const resultsDir = path.resolve(__dirname, '../../results');

          try {
            const files = fs
              .readdirSync(resultsDir)
              .filter((file) => file.endsWith('.json'))
              .sort((a, b) => {
                const statA = fs.statSync(path.join(resultsDir, a));
                const statB = fs.statSync(path.join(resultsDir, b));
                return statB.mtime.getTime() - statA.mtime.getTime();
              });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(files));
          } catch (error) {
            console.error('Failed to read results directory:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
          }
        },
      );

      server.middlewares.use(
        '/results/',
        (
          req: IncomingMessage,
          res: ServerResponse,
          next: Connect.NextFunction,
        ) => {
          if (!req.url) {
            next();
            return;
          }

          const fileName = req.url.replace('/', '');
          const filePath = path.resolve(__dirname, '../../results', fileName);

          try {
            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(content);
            } else {
              next();
            }
          } catch (error) {
            console.error('Failed to read file:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
          }
        },
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), resultsMiddleware()],
  server: {
    port: 3000,
  },
  build: {
    outDir: '../../dist/visualizer',
  },
});
