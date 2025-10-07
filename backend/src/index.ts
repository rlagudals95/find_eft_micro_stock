import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { analysisRoutes } from './routes/analysisRoutes';
import { etfRoutes } from './routes/etfRoutes';
import { hiddenGemsRoutes } from './routes/hiddenGemsRoutes';
import { testRoutes } from './routes/testRoutes';
import { scheduleDataCollection } from './services/scheduler';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 로깅 미들웨어
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip, userAgent: req.get('User-Agent') });
  next();
});

// 라우트 설정
app.use('/api/etf', etfRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/hidden-gems', hiddenGemsRoutes);
app.use('/api/test', testRoutes);

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 에러 핸들링
app.use(errorHandler);

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 데이터 수집 스케줄러 시작
scheduleDataCollection();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 ETF Stars API Server running on http://localhost:${PORT}`);
});

export default app;
