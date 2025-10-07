import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class DataCollectorService {
  private readonly logger = new Logger(DataCollectorService.name);

  constructor(private configService: ConfigService) {}

  async getStockQuote(symbol: string) {
    try {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
        {
          params: {
            interval: '1d',
            range: '1mo',
          },
        },
      );

      const result = response.data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];

      return {
        symbol,
        price: meta.regularMarketPrice,
        change: meta.regularMarketPrice - meta.chartPreviousClose,
        changePercent:
          ((meta.regularMarketPrice - meta.chartPreviousClose) /
            meta.chartPreviousClose) *
          100,
        volume: meta.regularMarketVolume,
        marketCap: meta.marketCap || 0,
        high52Week: meta.fiftyTwoWeekHigh,
        low52Week: meta.fiftyTwoWeekLow,
        avgVolume:
          quote.volume?.reduce((a: number, b: number) => a + b, 0) /
            quote.volume?.length || 0,
      };
    } catch (error) {
      this.logger.error(`Error fetching quote for ${symbol}:`, error.message);
      return null;
    }
  }

  async getFinancialData(symbol: string) {
    const apiKey = this.configService.get('FMP_API_KEY') || 'demo';

    try {
      const [incomeResponse, balanceResponse, ratiosResponse] =
        await Promise.all([
          axios.get(
            `https://financialmodelingprep.com/api/v3/income-statement/${symbol}`,
            {
              params: { apikey: apiKey, limit: 4 },
            },
          ),
          axios.get(
            `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}`,
            {
              params: { apikey: apiKey, limit: 4 },
            },
          ),
          axios.get(
            `https://financialmodelingprep.com/api/v3/ratios/${symbol}`,
            {
              params: { apikey: apiKey, limit: 1 },
            },
          ),
        ]);

      const income = incomeResponse.data[0] || {};
      const balance = balanceResponse.data[0] || {};
      const ratios = ratiosResponse.data[0] || {};

      const revenueGrowth =
        incomeResponse.data.length >= 2
          ? ((incomeResponse.data[0].revenue -
              incomeResponse.data[1].revenue) /
              incomeResponse.data[1].revenue) *
            100
          : 0;

      const earningsGrowth =
        incomeResponse.data.length >= 2
          ? ((incomeResponse.data[0].netIncome -
              incomeResponse.data[1].netIncome) /
              incomeResponse.data[1].netIncome) *
            100
          : 0;

      return {
        revenue: income.revenue || 0,
        netIncome: income.netIncome || 0,
        grossProfit: income.grossProfit || 0,
        operatingIncome: income.operatingIncome || 0,
        grossMargin: (income.grossProfit / income.revenue) * 100 || 0,
        operatingMargin: (income.operatingIncome / income.revenue) * 100 || 0,
        netMargin: (income.netIncome / income.revenue) * 100 || 0,
        revenueGrowth,
        earningsGrowth,
        totalAssets: balance.totalAssets || 0,
        totalDebt: balance.totalDebt || 0,
        totalEquity: balance.totalStockholdersEquity || 0,
        currentRatio: ratios.currentRatio || 0,
        quickRatio: ratios.quickRatio || 0,
        debtToEquity: ratios.debtEquityRatio || 0,
        roe: ratios.returnOnEquity * 100 || 0,
        roa: ratios.returnOnAssets * 100 || 0,
        pe: ratios.priceEarningsRatio || 0,
        pb: ratios.priceToBookRatio || 0,
        ps: ratios.priceToSalesRatio || 0,
        eps: income.eps || 0,
        epsGrowth: earningsGrowth,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching financial data for ${symbol}:`,
        error.message,
      );
      return null;
    }
  }

  async getNewsAndSentiment(symbol: string) {
    const apiKey = this.configService.get('FINNHUB_API_KEY') || 'demo';

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const response = await axios.get(
        `https://finnhub.io/api/v1/company-news`,
        {
          params: {
            symbol,
            from: thirtyDaysAgo.toISOString().split('T')[0],
            to: new Date().toISOString().split('T')[0],
            token: apiKey,
          },
        },
      );

      const news = response.data.slice(0, 10).map((item: any) => ({
        headline: item.headline,
        summary: item.summary,
        source: item.source,
        url: item.url,
        datetime: new Date(item.datetime * 1000).toISOString(),
        sentiment: this.analyzeSentiment(item.headline + ' ' + item.summary),
      }));

      const sentimentScore =
        news.reduce((sum: number, item: any) => sum + item.sentiment, 0) /
        news.length;

      return {
        news,
        sentimentScore: Math.round((sentimentScore + 1) * 50),
        newsCount: news.length,
      };
    } catch (error) {
      this.logger.error(`Error fetching news for ${symbol}:`, error.message);
      return { news: [], sentimentScore: 50, newsCount: 0 };
    }
  }

  async getTechnicalIndicators(symbol: string) {
    try {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
        {
          params: {
            interval: '1d',
            range: '6mo',
          },
        },
      );

      const result = response.data.chart.result[0];
      const quotes = result.indicators.quote[0];
      const closes = quotes.close.filter((c: number) => c !== null);

      const sma20 = this.calculateSMA(closes, 20);
      const sma50 = this.calculateSMA(closes, 50);
      const sma200 = this.calculateSMA(closes, 200);
      const rsi = this.calculateRSI(closes, 14);
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
        momentum: rsi > 50 ? 'positive' : 'negative',
      };
    } catch (error) {
      this.logger.error(
        `Error calculating technical indicators for ${symbol}:`,
        error.message,
      );
      return null;
    }
  }

  async getComprehensiveAnalysis(symbol: string) {
    const [quote, financial, news, technical] = await Promise.all([
      this.getStockQuote(symbol),
      this.getFinancialData(symbol),
      this.getNewsAndSentiment(symbol),
      this.getTechnicalIndicators(symbol),
    ]);

    return {
      symbol,
      quote,
      financial,
      news,
      technical,
      analyzedAt: new Date().toISOString(),
    };
  }

  private analyzeSentiment(text: string): number {
    const positiveWords = [
      'growth',
      'profit',
      'increase',
      'gain',
      'surge',
      'rally',
      'beat',
      'strong',
      'positive',
      'upgrade',
    ];
    const negativeWords = [
      'loss',
      'decline',
      'fall',
      'drop',
      'weak',
      'negative',
      'downgrade',
      'miss',
      'concern',
      'risk',
    ];

    const lowerText = text.toLowerCase();
    let score = 0;

    positiveWords.forEach((word) => {
      if (lowerText.includes(word)) score += 0.1;
    });

    negativeWords.forEach((word) => {
      if (lowerText.includes(word)) score -= 0.1;
    });

    return Math.max(-1, Math.min(1, score));
  }

  private calculateSMA(data: number[], period: number): number {
    if (data.length < period) return 0;
    const slice = data.slice(-period);
    return slice.reduce((sum, val) => sum + val, 0) / period;
  }

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
    return 100 - 100 / (1 + rs);
  }

  private calculateMACD(data: number[]) {
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    const macd = ema12 - ema26;
    const signal = macd;
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  private calculateEMA(data: number[], period: number): number {
    if (data.length < period) return 0;

    const multiplier = 2 / (period + 1);
    let ema =
      data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;

    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }

    return ema;
  }
}
