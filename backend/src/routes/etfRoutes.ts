import { Router } from 'express';
import { ETFDataService } from '../services/etfDataService';
import { logger } from '../utils/logger';

const router = Router();
const etfDataService = new ETFDataService();

// 모든 ETF 목록 조회
router.get('/', async (req, res, next) => {
  try {
    const etfSymbols = ['ARKK', 'IVES', 'GRNY', 'AOTG'];
    const etfs = [];
    
    for (const symbol of etfSymbols) {
      try {
        const etf = await etfDataService.getETFOverview(symbol);
        etfs.push(etf);
      } catch (error) {
        logger.error(`Error getting ETF ${symbol}:`, error);
        // 개별 ETF 오류는 무시하고 계속 진행
      }
    }
    
    return res.json({
      success: true,
      data: etfs,
      count: etfs.length
    });
  } catch (error) {
    return next(error);
  }
});

// 특정 ETF 상세 정보 조회
router.get('/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const etf = await etfDataService.getETFOverview(symbol.toUpperCase());
    
    return res.json({
      success: true,
      data: etf
    });
  } catch (error) {
    return next(error);
  }
});

// 특정 ETF의 보유 종목 조회
router.get('/:symbol/holdings', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const holdings = await etfDataService.getETFHoldings(symbol.toUpperCase());
    
    return res.json({
      success: true,
      data: holdings,
      count: holdings.length
    });
  } catch (error) {
    return next(error);
  }
});

// 특정 종목의 상세 정보 조회
router.get('/stock/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const stockData = await etfDataService.getStockData(symbol.toUpperCase());
    
    if (!stockData) {
      return res.status(404).json({
        success: false,
        error: 'Stock data not found'
      });
    }
    
    return res.json({
      success: true,
      data: stockData
    });
  } catch (error) {
    return next(error);
  }
});

export { router as etfRoutes };
