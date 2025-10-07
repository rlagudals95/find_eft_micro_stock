import cron from 'node-cron';
import { ETFDataService } from './etfDataService';
import { logger } from '../utils/logger';

const etfDataService = new ETFDataService();

// 매일 오전 9시에 데이터 수집 (미국 시장 개장 전)
const DAILY_COLLECTION_SCHEDULE = '0 9 * * *';

// 매주 월요일 오전 8시에 전체 분석 실행
const WEEKLY_ANALYSIS_SCHEDULE = '0 8 * * 1';

export function scheduleDataCollection(): void {
  logger.info('Starting data collection scheduler...');

  // 일일 데이터 수집
  cron.schedule(DAILY_COLLECTION_SCHEDULE, async () => {
    logger.info('Starting daily data collection...');
    
    try {
      const etfSymbols = ['ARKK', 'IVES', 'GRNY', 'AOTG'];
      
      for (const symbol of etfSymbols) {
        try {
          logger.info(`Collecting data for ${symbol}...`);
          
          // ETF 기본 정보 업데이트
          await etfDataService.getETFOverview(symbol);
          
          // 보유 종목 정보 업데이트
          await etfDataService.getETFHoldings(symbol);
          
          logger.info(`Successfully collected data for ${symbol}`);
        } catch (error) {
          logger.error(`Error collecting data for ${symbol}:`, error);
        }
      }
      
      logger.info('Daily data collection completed');
    } catch (error) {
      logger.error('Error in daily data collection:', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/New_York'
  });

  // 주간 성장주 분석
  cron.schedule(WEEKLY_ANALYSIS_SCHEDULE, async () => {
    logger.info('Starting weekly growth stock analysis...');
    
    try {
      const growthStocks = await etfDataService.analyzeGrowthStocks();
      logger.info(`Analysis completed. Found ${growthStocks.length} growth stocks`);
      
      // 여기서 데이터베이스에 결과 저장하거나 알림 발송
      // await saveAnalysisResults(growthStocks);
      
    } catch (error) {
      logger.error('Error in weekly analysis:', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/New_York'
  });

  logger.info('Data collection scheduler started successfully');
}

// 수동 데이터 수집 함수
export async function collectDataNow(): Promise<void> {
  logger.info('Manual data collection started...');
  
  try {
    const etfSymbols = ['ARKK', 'IVES', 'GRNY', 'AOTG'];
    
    for (const symbol of etfSymbols) {
      try {
        logger.info(`Collecting data for ${symbol}...`);
        
        await etfDataService.getETFOverview(symbol);
        await etfDataService.getETFHoldings(symbol);
        
        logger.info(`Successfully collected data for ${symbol}`);
      } catch (error) {
        logger.error(`Error collecting data for ${symbol}:`, error);
      }
    }
    
    logger.info('Manual data collection completed');
  } catch (error) {
    logger.error('Error in manual data collection:', error);
    throw error;
  }
}
