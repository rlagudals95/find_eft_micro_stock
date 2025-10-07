import axios from 'axios';
import { ETF, ETFExposure, GrowthStock, Holding, StockData } from '../types';
import { logger } from '../utils/logger';

export class ETFDataService {
  private readonly ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
  private readonly YAHOO_FINANCE_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

  // ETF 기본 정보 정의
  private readonly ETF_CONFIGS = {
    ARKK: {
      symbol: 'ARKK',
      name: 'ARK Innovation ETF',
      description: 'ARK Innovation ETF seeks long-term growth of capital by investing in companies that benefit from disruptive innovation',
      expenseRatio: 0.75,
      inceptionDate: '2014-10-31'
    },
    IVES: {
      symbol: 'IVES',
      name: 'Dan IVES Wedbush AI Revolution ETF',
      description: 'AI Revolution ETF focusing on artificial intelligence companies',
      expenseRatio: 0.75,
      inceptionDate: '2023-01-01'
    },
    GRNY: {
      symbol: 'GRNY',
      name: 'Fundstrat Granny Shots US 대형주 ETF',
      description: 'Large-cap US growth stocks ETF',
      expenseRatio: 0.75,
      inceptionDate: '2023-01-01'
    },
    AOTG: {
      symbol: 'AOTG',
      name: 'AOT 성장 및 혁신 ETF',
      description: 'Growth and Innovation ETF',
      expenseRatio: 0.75,
      inceptionDate: '2023-01-01'
    }
  };

  async getETFOverview(symbol: string): Promise<ETF> {
    try {
      const config = this.ETF_CONFIGS[symbol as keyof typeof this.ETF_CONFIGS];
      if (!config) {
        throw new Error(`ETF ${symbol} not found`);
      }

      // Yahoo Finance에서 ETF 기본 정보 가져오기
      const response = await axios.get(`${this.YAHOO_FINANCE_BASE_URL}/${symbol}`);
      const data = response.data.chart.result[0];
      
      if (!data) {
        throw new Error(`No data found for ${symbol}`);
      }

      const meta = data.meta;
      
      return {
        id: symbol,
        symbol: symbol,
        name: config.name,
        description: config.description,
        expenseRatio: config.expenseRatio,
        totalAssets: meta.marketCap || 0,
        inceptionDate: config.inceptionDate,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Error getting ETF overview for ${symbol}:`, error);
      throw error;
    }
  }

  async getStockData(symbol: string): Promise<StockData | null> {
    try {
      const response = await axios.get(`${this.YAHOO_FINANCE_BASE_URL}/${symbol}`);
      const data = response.data.chart.result[0];
      
      if (!data) return null;

      const meta = data.meta;
      const quote = data.indicators.quote[0];
      
      return {
        symbol: symbol,
        name: meta.longName || symbol,
        price: meta.regularMarketPrice || 0,
        marketCap: meta.marketCap || 0,
        volume: meta.volume || 0,
        changePercent: meta.regularMarketChangePercent || 0,
        pe: meta.trailingPE || 0,
        pb: meta.priceToBook || 0,
        roe: 0, // 별도 API 필요
        debtToEquity: 0, // 별도 API 필요
        revenueGrowth: 0, // 별도 API 필요
        earningsGrowth: 0, // 별도 API 필요
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Error getting stock data for ${symbol}:`, error);
      return null;
    }
  }

  // 모의 데이터 - 실제로는 ETF 공식 사이트에서 스크래핑하거나 API 사용
  async getETFHoldings(symbol: string): Promise<Holding[]> {
    try {
      // 실제 구현에서는 ETF 공식 사이트에서 스크래핑하거나
      // 전문 데이터 제공업체 API 사용
      
      // 모의 데이터 반환 (실제로는 동적 수집)
      const mockHoldings: { [key: string]: any[] } = {
        ARKK: [
          { symbol: 'TSLA', name: 'Tesla Inc', weight: 8.5, shares: 1000000 },
          { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 7.2, shares: 800000 },
          { symbol: 'COIN', name: 'Coinbase Global Inc', weight: 6.8, shares: 600000 },
          { symbol: 'ROKU', name: 'Roku Inc', weight: 5.5, shares: 500000 },
          { symbol: 'SQ', name: 'Block Inc', weight: 4.8, shares: 400000 },
          { symbol: 'ZM', name: 'Zoom Video Communications', weight: 3.2, shares: 300000 },
          { symbol: 'TDOC', name: 'Teladoc Health Inc', weight: 2.8, shares: 250000 },
          { symbol: 'CRWD', name: 'CrowdStrike Holdings Inc', weight: 2.5, shares: 200000 },
          { symbol: 'PLTR', name: 'Palantir Technologies Inc', weight: 2.1, shares: 180000 },
          { symbol: 'SNOW', name: 'Snowflake Inc', weight: 1.8, shares: 150000 }
        ],
        IVES: [
          { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 12.5, shares: 1200000 },
          { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 10.8, shares: 1000000 },
          { symbol: 'GOOGL', name: 'Alphabet Inc', weight: 9.5, shares: 900000 },
          { symbol: 'META', name: 'Meta Platforms Inc', weight: 8.2, shares: 800000 },
          { symbol: 'AMZN', name: 'Amazon.com Inc', weight: 7.5, shares: 700000 },
          { symbol: 'TSLA', name: 'Tesla Inc', weight: 6.8, shares: 600000 },
          { symbol: 'NFLX', name: 'Netflix Inc', weight: 5.2, shares: 500000 },
          { symbol: 'ADBE', name: 'Adobe Inc', weight: 4.8, shares: 450000 },
          { symbol: 'CRM', name: 'Salesforce Inc', weight: 4.2, shares: 400000 },
          { symbol: 'ORCL', name: 'Oracle Corporation', weight: 3.5, shares: 350000 }
        ]
      };

      const holdingsData = mockHoldings[symbol] || [];
      
      return holdingsData.map((holding, index) => ({
        id: `${symbol}-${index}`,
        etfId: symbol,
        symbol: holding.symbol,
        name: holding.name,
        weight: holding.weight,
        shares: holding.shares,
        marketValue: 0, // 실제 계산 필요
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      logger.error(`Error getting holdings for ${symbol}:`, error);
      throw error;
    }
  }

  async analyzeGrowthStocks(): Promise<GrowthStock[]> {
    try {
      const growthStocks: GrowthStock[] = [];
      const etfSymbols = Object.keys(this.ETF_CONFIGS);

      for (const etfSymbol of etfSymbols) {
        const holdings = await this.getETFHoldings(etfSymbol);
        
        for (const holding of holdings) {
          const stockData = await this.getStockData(holding.symbol);
          if (!stockData) continue;

          // 성장주 점수 계산
          const score = this.calculateGrowthScore(stockData, holding);
          const reasons = this.getGrowthReasons(stockData, holding);
          
          if (score > 70) { // 임계값 설정
            const etfExposure: ETFExposure[] = [{
              etfSymbol: etfSymbol,
              etfName: this.ETF_CONFIGS[etfSymbol as keyof typeof this.ETF_CONFIGS].name,
              weight: holding.weight,
              position: holding.weight > 5 ? 'top' : holding.weight > 2 ? 'middle' : 'bottom'
            }];

            growthStocks.push({
              symbol: holding.symbol,
              name: holding.name,
              score: score,
              reasons: reasons,
              etfExposure: etfExposure,
              metrics: {
                marketCap: stockData.marketCap,
                pe: stockData.pe,
                revenueGrowth: stockData.revenueGrowth,
                earningsGrowth: stockData.earningsGrowth,
                roe: stockData.roe
              },
              lastUpdated: new Date().toISOString()
            });
          }
        }
      }

      // 점수순으로 정렬
      return growthStocks.sort((a, b) => b.score - a.score);
    } catch (error) {
      logger.error('Error analyzing growth stocks:', error);
      throw error;
    }
  }

  private calculateGrowthScore(stockData: StockData, holding: Holding): number {
    let score = 0;
    
    // 시가총액 기반 점수 (중소형주 선호)
    if (stockData.marketCap < 10_000_000_000) score += 30; // 100억 달러 미만
    else if (stockData.marketCap < 50_000_000_000) score += 20; // 500억 달러 미만
    else if (stockData.marketCap < 100_000_000_000) score += 10; // 1000억 달러 미만
    
    // ETF 내 비중 기반 점수 (소액 보유 선호)
    if (holding.weight < 1) score += 25; // 1% 미만
    else if (holding.weight < 3) score += 15; // 3% 미만
    else if (holding.weight < 5) score += 5; // 5% 미만
    
    // 거래량 기반 점수
    if (stockData.volume > 1_000_000) score += 15;
    else if (stockData.volume > 500_000) score += 10;
    
    // 가격 변동성 기반 점수
    const volatility = Math.abs(stockData.changePercent);
    if (volatility > 5) score += 20;
    else if (volatility > 3) score += 10;
    
    // P/E 비율 기반 점수 (성장주 선호)
    if (stockData.pe > 0 && stockData.pe < 30) score += 10;
    
    return Math.min(score, 100);
  }

  private getGrowthReasons(stockData: StockData, holding: Holding): string[] {
    const reasons: string[] = [];
    
    if (stockData.marketCap < 10_000_000_000) {
      reasons.push('중소형주로 성장 잠재력 높음');
    }
    
    if (holding.weight < 1) {
      reasons.push('ETF 내 소액 보유로 전문가 관심 종목');
    }
    
    if (Math.abs(stockData.changePercent) > 5) {
      reasons.push('높은 가격 변동성으로 주목받는 종목');
    }
    
    if (stockData.volume > 1_000_000) {
      reasons.push('높은 거래량으로 시장 관심도 높음');
    }
    
    if (stockData.pe > 0 && stockData.pe < 30) {
      reasons.push('합리적인 밸류에이션');
    }
    
    return reasons;
  }
}
