import axios from 'axios';
import { logger } from '../utils/logger';

// 실제 데이터 수집 서비스
export class RealDataCollector {
  private readonly ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
  private readonly FMP_KEY = process.env.FMP_API_KEY || 'demo';
  private readonly FINNHUB_KEY = process.env.FINNHUB_API_KEY || 'demo';

  // Yahoo Finance를 통한 실시간 주가 데이터
  async getStockQuote(symbol: string) {
    try {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
        {
          params: {
            interval: '1d',
            range: '1mo'
          }
        }
      );

      const result = response.data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];

      return {
        symbol,
        price: meta.regularMarketPrice,
        change: meta.regularMarketPrice - meta.chartPreviousClose,
        changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
        volume: meta.regularMarketVolume,
        marketCap: meta.marketCap || 0,
        high52Week: meta.fiftyTwoWeekHigh,
        low52Week: meta.fiftyTwoWeekLow,
        avgVolume: quote.volume?.reduce((a: number, b: number) => a + b, 0) / quote.volume?.length || 0
      };
    } catch (error) {
      logger.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  // Financial Modeling Prep - 재무 데이터
  async getFinancialData(symbol: string) {
    try {
      // 재무제표
      const [incomeResponse, balanceResponse, ratiosResponse] = await Promise.all([
        axios.get(`https://financialmodelingprep.com/api/v3/income-statement/${symbol}`, {
          params: { apikey: this.FMP_KEY, limit: 4 }
        }),
        axios.get(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}`, {
          params: { apikey: this.FMP_KEY, limit: 4 }
        }),
        axios.get(`https://financialmodelingprep.com/api/v3/ratios/${symbol}`, {
          params: { apikey: this.FMP_KEY, limit: 1 }
        })
      ]);

      const income = incomeResponse.data[0] || {};
      const balance = balanceResponse.data[0] || {};
      const ratios = ratiosResponse.data[0] || {};

      // 성장률 계산
      const revenueGrowth = incomeResponse.data.length >= 2
        ? ((incomeResponse.data[0].revenue - incomeResponse.data[1].revenue) / incomeResponse.data[1].revenue) * 100
        : 0;

      const earningsGrowth = incomeResponse.data.length >= 2
        ? ((incomeResponse.data[0].netIncome - incomeResponse.data[1].netIncome) / incomeResponse.data[1].netIncome) * 100
        : 0;

      return {
        // 수익성
        revenue: income.revenue || 0,
        netIncome: income.netIncome || 0,
        grossProfit: income.grossProfit || 0,
        operatingIncome: income.operatingIncome || 0,
        
        // 마진
        grossMargin: (income.grossProfit / income.revenue) * 100 || 0,
        operatingMargin: (income.operatingIncome / income.revenue) * 100 || 0,
        netMargin: (income.netIncome / income.revenue) * 100 || 0,
        
        // 성장성
        revenueGrowth,
        earningsGrowth,
        
        // 안정성
        totalAssets: balance.totalAssets || 0,
        totalDebt: balance.totalDebt || 0,
        totalEquity: balance.totalStockholdersEquity || 0,
        currentRatio: ratios.currentRatio || 0,
        quickRatio: ratios.quickRatio || 0,
        debtToEquity: ratios.debtEquityRatio || 0,
        
        // 수익률
        roe: ratios.returnOnEquity * 100 || 0,
        roa: ratios.returnOnAssets * 100 || 0,
        
        // 밸류에이션
        pe: ratios.priceEarningsRatio || 0,
        pb: ratios.priceToBookRatio || 0,
        ps: ratios.priceToSalesRatio || 0,
        
        // EPS
        eps: income.eps || 0,
        epsGrowth: earningsGrowth
      };
    } catch (error) {
      logger.error(`Error fetching financial data for ${symbol}:`, error);
      return null;
    }
  }

  // Finnhub - 뉴스 및 센티먼트
  async getNewsAndSentiment(symbol: string) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const response = await axios.get(`https://finnhub.io/api/v1/company-news`, {
        params: {
          symbol,
          from: thirtyDaysAgo.toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0],
          token: this.FINNHUB_KEY
        }
      });

      const news = response.data.slice(0, 10).map((item: any) => ({
        headline: item.headline,
        summary: item.summary,
        source: item.source,
        url: item.url,
        datetime: new Date(item.datetime * 1000).toISOString(),
        sentiment: this.analyzeSentiment(item.headline + ' ' + item.summary)
      }));

      // 전체 센티먼트 점수 계산
      const sentimentScore = news.reduce((sum: number, item: any) => sum + item.sentiment, 0) / news.length;

      return {
        news,
        sentimentScore: Math.round((sentimentScore + 1) * 50), // -1~1을 0~100으로 변환
        newsCount: news.length
      };
    } catch (error) {
      logger.error(`Error fetching news for ${symbol}:`, error);
      return { news: [], sentimentScore: 50, newsCount: 0 };
    }
  }

  // 간단한 센티먼트 분석 (키워드 기반)
  private analyzeSentiment(text: string): number {
    const positiveWords = ['growth', 'profit', 'increase', 'gain', 'surge', 'rally', 'beat', 'strong', 'positive', 'upgrade'];
    const negativeWords = ['loss', 'decline', 'fall', 'drop', 'weak', 'negative', 'downgrade', 'miss', 'concern', 'risk'];
    
    const lowerText = text.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 0.1;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 0.1;
    });
    
    return Math.max(-1, Math.min(1, score));
  }

  // 기술적 지표 계산
  async getTechnicalIndicators(symbol: string) {
    try {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
        {
          params: {
            interval: '1d',
            range: '6mo'
          }
        }
      );

      const result = response.data.chart.result[0];
      const quotes = result.indicators.quote[0];
      const closes = quotes.close.filter((c: number) => c !== null);

      // 이동평균 계산
      const sma20 = this.calculateSMA(closes, 20);
      const sma50 = this.calculateSMA(closes, 50);
      const sma200 = this.calculateSMA(closes, 200);

      // RSI 계산
      const rsi = this.calculateRSI(closes, 14);

      // MACD 계산
      const macd = this.calculateMACD(closes);

      const currentPrice = closes[closes.length - 1];

      return {
        sma20,
        sma50,
        sma200,
        rsi,
        macd: macd.macd,
        signal: macd.signal,
        histogram: macd.histogram,
        trend: currentPrice > sma50 ? 'bullish' : 'bearish',
        momentum: rsi > 50 ? 'positive' : 'negative'
      };
    } catch (error) {
      logger.error(`Error calculating technical indicators for ${symbol}:`, error);
      return null;
    }
  }

  // SMA (Simple Moving Average) 계산
  private calculateSMA(data: number[], period: number): number {
    if (data.length < period) return 0;
    const slice = data.slice(-period);
    return slice.reduce((sum, val) => sum + val, 0) / period;
  }

  // RSI (Relative Strength Index) 계산
  private calculateRSI(data: number[], period: number = 14): number {
    if (data.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = data.length - period; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // MACD 계산
  private calculateMACD(data: number[]) {
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    const macd = ema12 - ema26;
    
    // Signal line은 MACD의 9일 EMA
    const macdLine = [macd]; // 실제로는 여러 기간의 MACD 필요
    const signal = macd; // 간소화
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  // EMA (Exponential Moving Average) 계산
  private calculateEMA(data: number[], period: number): number {
    if (data.length < period) return 0;
    
    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;

    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  // ARK ETF 보유 종목 (실제 CSV 다운로드)
  async getARKHoldings(etfSymbol: string) {
    try {
      const csvUrl = `https://ark-funds.com/wp-content/uploads/funds-etf-csv/ARK_${etfSymbol}_ETF_${etfSymbol}_HOLDINGS.csv`;
      
      const response = await axios.get(csvUrl);
      const lines = response.data.split('\n');
      
      // CSV 파싱 (헤더 스킵)
      const holdings = [];
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        if (columns.length >= 6) {
          holdings.push({
            date: columns[0],
            fund: columns[1],
            company: columns[2],
            ticker: columns[3],
            cusip: columns[4],
            shares: parseFloat(columns[5]) || 0,
            marketValue: parseFloat(columns[6]) || 0,
            weight: parseFloat(columns[7]) || 0
          });
        }
      }

      return holdings;
    } catch (error) {
      logger.error(`Error fetching ARK holdings for ${etfSymbol}:`, error);
      return [];
    }
  }

  // 종합 분석
  async getComprehensiveAnalysis(symbol: string) {
    try {
      const [quote, financial, news, technical] = await Promise.all([
        this.getStockQuote(symbol),
        this.getFinancialData(symbol),
        this.getNewsAndSentiment(symbol),
        this.getTechnicalIndicators(symbol)
      ]);

      return {
        symbol,
        quote,
        financial,
        news,
        technical,
        analyzedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Error in comprehensive analysis for ${symbol}:`, error);
      throw error;
    }
  }
}
