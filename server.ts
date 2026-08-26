import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import http from 'http';
import { createServer as createViteServer } from 'vite';

import { initMongoDB, isMongoConnected } from './server/db/index.ts';
import { authMiddleware } from './server/auth.ts';
import { authRouter } from './server/routes/auth.routes.ts';
import { studentRouter } from './server/routes/student.routes.ts';
import { captainRouter } from './server/routes/captain.routes.ts';
import { adminRouter } from './server/routes/admin.routes.ts';
import { systemRouter } from './server/routes/system.routes.ts';

dotenv.config();

export const app = express();

// Initialize MongoDB in background
initMongoDB().catch((err) => console.error('[ClassHQ] MongoDB init error:', err));

// Global Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(authMiddleware);

// Middleware to ensure DB connection readiness on serverless cold starts
app.use(async (req, res, next) => {
  if (process.env.MONGO_URI || process.env.MONGODB_URI) {
    if (!isMongoConnected) {
      try {
        await initMongoDB();
      } catch (err) {
        console.error('[ClassHQ] MongoDB cold start connect error:', err);
      }
    }
  }
  next();
});

// Mount Modular API Routers
app.use('/api', systemRouter);
app.use('/api/auth', authRouter);
app.use('/api/student', studentRouter);
app.use('/api/captain', captainRouter);
app.use('/api/admin', adminRouter);

// Vite Middleware & SPA Fallback Handler
export async function startServer() {
  const PORT = 3000;
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[ClassHQ Server] Running on http://localhost:${PORT}`);
  });
}

// Start standalone HTTP listener only when not running in serverless environment
if (!process.env.VERCEL) {
  startServer();
}

export default app;
