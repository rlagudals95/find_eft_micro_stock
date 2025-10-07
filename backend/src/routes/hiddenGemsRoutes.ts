import { Router } from 'express';
import { ETFDataService } from '../services/etfDataService';
import { InvestmentAnalyzer } from '../services/investmentAnalyzer';
import { RealDataCollector } from '../services/realDataCollector';
import { logger } from '../utils/logger';

const router = Router();
const realDataCollector = new RealDataCollector();
const investmentAnalyzer = new InvestmentAnalyzer();
const etfDataService = new ETFDataService();

// 숨은 보석 발굴 - 실제 데이터 사용
router.get('/discover', async (req, res, next) => {
  try {
    const { etf = 'all', minWeight = 0.1, maxWeight = 2.0, limit = 20 } = req.query;
    
    logger.info('Hidden gems discovery started', { etf, minWeight, maxWeight });

    const etfSymbols = etf === 'all' ? ['ARKK', 'IVES', 'GRNY', 'AOTG'] : [etf as string];
    const hiddenGems = [];

    for (const etfSymbol of etfSymbols) {
      try {
        // ETF 보유 종목 가져오기
        const holdings = await etfDataService.getETFHoldings(etfSymbol);
        
        // 소량 보유 종목 필터링
        const smallHoldings = holdings
          .filter(h => h.weight >= Number(minWeight) && h.weight <= Number(maxWeight))
          .sort((a, b) => a.weight - b.weight)
          .slice(0, 10); // ETF당 최대 10개

        for (const holding of smallHoldings) {
          try {
            // 실제 데이터 수집
            const comprehensiveData = await realDataCollector.getComprehensiveAnalysis(holding.symbol);
            
            // 투자 점수 계산
            const investmentScore = investmentAnalyzer.calculateInvestmentScore(
              comprehensiveData,
              holding.weight
            );

            // 상승 가능성 분석
            const growthPotential = investmentAnalyzer.calculateGrowthPotential(
              comprehensiveData,
              investmentScore
            );

            hiddenGems.push({
              symbol: holding.symbol,
              name: holding.name,
              etfSymbol,
              etfName: etfSymbol,
              weight: holding.weight,
              shares: holding.shares,
              
              // 현재 가격 정보
              currentPrice: comprehensiveData.quote?.price || 0,
              change: comprehensiveData.quote?.change || 0,
              changePercent: comprehensiveData.quote?.changePercent || 0,
              
              // 투자 분석
              investmentScore,
              growthPotential,
              
              // 재무 데이터
              financial: comprehensiveData.financial,
              
              // 기술적 지표
              technical: comprehensiveData.technical,
              
              // 뉴스
              recentNews: comprehensiveData.news?.news.slice(0, 3) || [],
              sentimentScore: comprehensiveData.news?.sentimentScore || 50,
              
              analyzedAt: new Date().toISOString()
            });

            // API 제한 고려 (딜레이)
            await new Promise(resolve => setTimeout(resolve, 500));
            
          } catch (error) {
            logger.error(`Error analyzing ${holding.symbol}:`, error);
          }
        }
      } catch (error) {
        logger.error(`Error processing ETF ${etfSymbol}:`, error);
      }
    }

    // 투자 점수순으로 정렬
    hiddenGems.sort((a, b) => b.investmentScore.totalScore - a.investmentScore.totalScore);

    return res.json({
      success: true,
      data: hiddenGems.slice(0, Number(limit)),
      count: hiddenGems.length,
      filters: {
        etf,
        minWeight: Number(minWeight),
        maxWeight: Number(maxWeight)
      },
      analyzedAt: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
});

// 특정 종목 상세 분석
router.get('/analyze/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { etfWeight = 1.0 } = req.query;

    logger.info(`Detailed analysis for ${symbol}`);

    // 종합 데이터 수집
    const comprehensiveData = await realDataCollector.getComprehensiveAnalysis(symbol);

    // 투자 점수 계산
    const investmentScore = investmentAnalyzer.calculateInvestmentScore(
      comprehensiveData,
      Number(etfWeight)
    );

    // 상승 가능성 분석
    const growthPotential = investmentAnalyzer.calculateGrowthPotential(
      comprehensiveData,
      investmentScore
    );

    return res.json({
      success: true,
      data: {
        ...comprehensiveData,
        investmentScore,
        growthPotential
      }
    });
  } catch (error) {
    return next(error);
  }
});

// 빠른 점수 계산 (캐시된 데이터 사용)
router.post('/quick-score', async (req, res, next) => {
  try {
    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({
        success: false,
        error: 'Symbols array is required'
      });
    }

    const results = [];

    for (const symbol of symbols.slice(0, 10)) { // 최대 10개
      try {
        const quote = await realDataCollector.getStockQuote(symbol);
        const financial = await realDataCollector.getFinancialData(symbol);

        if (quote && financial) {
          const simpleScore = investmentAnalyzer.calculateInvestmentScore(
            { quote, financial, technical: null, news: null },
            1.0
          );

          results.push({
            symbol,
            price: quote.price,
            score: simpleScore.totalScore,
            grade: simpleScore.grade,
            rating: simpleScore.rating
          });
        }
      } catch (error) {
        logger.error(`Error in quick score for ${symbol}:`, error);
      }
    }

    return res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    return next(error);
  }
});

export { router as hiddenGemsRoutes };
