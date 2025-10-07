import { Router } from 'express';
import { RealDataCollector } from '../services/realDataCollector';

const router = Router();
const collector = new RealDataCollector();

// API 테스트 엔드포인트
router.get('/yahoo-finance/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const data = await collector.getStockQuote(symbol);
    
    return res.json({
      success: true,
      data,
      message: 'Yahoo Finance API 테스트'
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/financial/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const data = await collector.getFinancialData(symbol);
    
    return res.json({
      success: true,
      data,
      message: 'Financial Modeling Prep API 테스트'
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/news/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const data = await collector.getNewsAndSentiment(symbol);
    
    return res.json({
      success: true,
      data,
      message: 'Finnhub News API 테스트'
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/technical/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const data = await collector.getTechnicalIndicators(symbol);
    
    return res.json({
      success: true,
      data,
      message: '기술적 지표 계산 테스트'
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/comprehensive/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const data = await collector.getComprehensiveAnalysis(symbol);
    
    return res.json({
      success: true,
      data,
      message: '종합 분석 테스트'
    });
  } catch (error) {
    return next(error);
  }
});

export { router as testRoutes };
