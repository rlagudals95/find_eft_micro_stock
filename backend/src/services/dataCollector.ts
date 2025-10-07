import axios from 'axios';
import puppeteer, { Browser } from 'puppeteer';
import { ETF, Holding, StockData } from '../types';
import { logger } from '../utils/logger';

export class ETFDataCollector {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async collectARKKData(): Promise<{ etf: ETF; holdings: Holding[] }> {
    try {
      const page = await this.browser!.newPage();
      await page.goto('https://ark-funds.com/arkk', { waitUntil: 'networkidle2' });

      // ETF 기본 정보 수집
      const etf: ETF = {
        id: 'ARKK',
        symbol: 'ARKK',
        name: 'ARK Innovation ETF',
        description: 'ARK Innovation ETF seeks long-term growth of capital by investing in companies that benefit from disruptive innovation',
        expenseRatio: 0.75,
        totalAssets: 0, // 실제 데이터로 업데이트 필요
        inceptionDate: '2014-10-31',
        lastUpdated: new Date().toISOString(),
      };

      // 보유 종목 정보 수집
      const holdings: Holding[] = [];
      
      // ARK 웹사이트에서 보유 종목 정보 추출
      const holdingsData = await page.evaluate(() => {
        const holdings: any[] = [];
        const rows = document.querySelectorAll('table tbody tr');
        
        rows.forEach((row: Element, index: number) => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 4) {
            const symbol = cells[0]?.textContent?.trim();
            const name = cells[1]?.textContent?.trim();
            const weight = parseFloat(cells[2]?.textContent?.replace('%', '') || '0');
            const shares = parseInt(cells[3]?.textContent?.replace(/,/g, '') || '0');
            
            if (symbol && name) {
              holdings.push({
                symbol,
                name,
                weight,
                shares,
                marketValue: 0, // 계산 필요
              });
            }
          }
        });
        
        return holdings;
      });

      holdingsData.forEach((holding: any, index: number) => {
        holdings.push({
          id: `ARKK-${index}`,
          etfId: 'ARKK',
          symbol: holding.symbol,
          name: holding.name,
          weight: holding.weight,
          shares: holding.shares,
          marketValue: holding.marketValue,
          lastUpdated: new Date().toISOString(),
        });
      });

      await page.close();
      return { etf, holdings };
    } catch (error) {
      logger.error('Error collecting ARKK data:', error);
      throw error;
    }
  }

  async collectYahooFinanceData(symbol: string): Promise<StockData | null> {
    try {
      const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
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
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(`Error collecting data for ${symbol}:`, error);
      return null;
    }
  }

  async collectAllETFData(): Promise<{ etf: ETF; holdings: Holding[] }[]> {
    const results: { etf: ETF; holdings: Holding[] }[] = [];
    
    try {
      // ARKK 데이터 수집
      const arkkData = await this.collectARKKData();
      results.push(arkkData);

      // 다른 ETF들도 추가 구현 필요
      // IVES, GRNY, AOTG 등

    } catch (error) {
      logger.error('Error collecting ETF data:', error);
      throw error;
    }

    return results;
  }
}
