import { Router } from 'express';
import { ETFDataService } from '../services/etfDataService';
import { logger } from '../utils/logger';

const router = Router();
const etfDataService = new ETFDataService();

// 성장주 분석 결과 조회
router.get('/growth-stocks', async (req, res, next) => {
  try {
    const { limit = 20, minScore = 70 } = req.query;
    
    const growthStocks = await etfDataService.analyzeGrowthStocks();
    
    // 필터링 및 정렬
    const filteredStocks = growthStocks
      .filter(stock => stock.score >= Number(minScore))
      .slice(0, Number(limit));
    
    return res.json({
      success: true,
      data: filteredStocks,
      count: filteredStocks.length,
      criteria: {
        minScore: Number(minScore),
        limit: Number(limit)
      }
    });
  } catch (error) {
    return next(error);
  }
});

// 특정 ETF의 성장주 분석
router.get('/etf/:symbol/growth-stocks', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { limit = 10 } = req.query;
    
    const holdings = await etfDataService.getETFHoldings(symbol.toUpperCase());
    const growthStocks = [];
    
    for (const holding of holdings.slice(0, Number(limit))) {
      try {
        const stockData = await etfDataService.getStockData(holding.symbol);
        if (!stockData) continue;
        
        const score = etfDataService['calculateGrowthScore'](stockData, holding);
        const reasons = etfDataService['getGrowthReasons'](stockData, holding);
        
        if (score >= 70) {
          growthStocks.push({
            symbol: holding.symbol,
            name: holding.name,
            score: score,
            reasons: reasons,
            weight: holding.weight,
            etfSymbol: symbol.toUpperCase()
          });
        }
      } catch (error) {
        logger.error(`Error analyzing stock ${holding.symbol}:`, error);
      }
    }
    
    return res.json({
      success: true,
      data: growthStocks.sort((a, b) => b.score - a.score),
      count: growthStocks.length,
      etfSymbol: symbol.toUpperCase()
    });
  } catch (error) {
    return next(error);
  }
});

// 시장 인사이트 조회
router.get('/market-insights', async (req, res, next) => {
  try {
    const insights = [
      {
        sector: 'Technology',
        trend: 'up' as const,
        confidence: 85,
        description: 'AI 및 반도체 관련 종목들이 강세를 보이고 있습니다.'
      },
      {
        sector: 'Healthcare',
        trend: 'stable' as const,
        confidence: 70,
        description: '바이오테크 및 디지털 헬스케어 분야가 안정적인 성장을 보입니다.'
      },
      {
        sector: 'Financial',
        trend: 'down' as const,
        confidence: 60,
        description: '금리 상승 우려로 금융주들이 부진한 모습을 보입니다.'
      }
    ];
    
    return res.json({
      success: true,
      data: insights,
      count: insights.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
});

// 포트폴리오 분석
router.post('/portfolio-analysis', async (req, res, next) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({
        success: false,
        error: 'Symbols array is required'
      });
    }
    
    const analysis = [];
    
    for (const symbol of symbols) {
      try {
        const stockData = await etfDataService.getStockData(symbol);
        if (stockData) {
          analysis.push({
            symbol: symbol,
            data: stockData,
            recommendation: stockData.changePercent > 0 ? 'BUY' : 'HOLD'
          });
        }
      } catch (error) {
        logger.error(`Error analyzing ${symbol}:`, error);
      }
    }
    
    return res.json({
      success: true,
      data: analysis,
      count: analysis.length,
      analyzedAt: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
});

export { router as analysisRoutes };
