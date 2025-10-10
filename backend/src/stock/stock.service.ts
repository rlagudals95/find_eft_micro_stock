import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import yahooFinance from 'yahoo-finance2';
import { NewsSentimentDto } from './dto/news-sentiment.dto';
import {
  BasicInfoDto,
  FinancialMetricsDto,
  GrowthMetricsDto,
  InvestmentRecommendation,
  InvestmentScoreDto,
  ProfitabilityDto,
  StockAnalysisDto,
  ValuationDto,
} from './dto/stock-analysis.dto';
import { FinnhubNewsService } from './services/finnhub-news.service';
import { NewsSentimentService } from './services/news-sentiment.service';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    private readonly newsSentimentService: NewsSentimentService,
    private readonly finnhubNewsService: FinnhubNewsService,
  ) {}

  async getStockAnalysis(symbol: string): Promise<StockAnalysisDto> {
    try {
      this.logger.log(`Fetching stock analysis for ${symbol}...`);

      // Yahoo Finance에서 데이터 가져오기
      const quote = await yahooFinance.quoteSummary(symbol, {
        modules: [
          'price',
          'summaryDetail',
          'defaultKeyStatistics',
          'financialData',
          'summaryProfile',
        ],
      });

      if (!quote) {
        throw new NotFoundException(`Stock ${symbol} not found`);
      }

      // 기본 정보 추출
      const basic = this.extractBasicInfo(symbol, quote);
      
      // 재무 지표 추출
      const financials = this.extractFinancialMetrics(quote);
      
      // 수익성 지표 추출
      const profitability = this.extractProfitability(quote);
      
      // 성장성 지표 추출
      const growth = this.extractGrowthMetrics(quote);
      
      // 밸류에이션 계산
      const valuation = this.calculateValuation(quote, financials);
      
      // 투자 점수 계산
      const investmentScore = this.calculateInvestmentScore(
        financials,
        profitability,
        growth,
        valuation,
      );
      
      // 투자 추천 및 근거 생성
      const { recommendation, reasons } = this.generateRecommendation(
        investmentScore,
        financials,
        profitability,
        growth,
      );

      return {
        basic,
        financials,
        profitability,
        growth,
        valuation,
        investmentScore,
        recommendation,
        reasons,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error fetching stock analysis for ${symbol}:`, error);
      throw error;
    }
  }

  private extractBasicInfo(symbol: string, quote: any): BasicInfoDto {
    const price = quote.price || {};
    const profile = quote.summaryProfile || {};

    return {
      symbol: symbol.toUpperCase(),
      name: price.longName || price.shortName || symbol,
      price: price.regularMarketPrice || 0,
      marketCap: price.marketCap || 0,
      sector: profile.sector || 'N/A',
      industry: profile.industry || 'N/A',
      country: profile.country || 'N/A',
    };
  }

  private extractFinancialMetrics(quote: any): FinancialMetricsDto {
    const summary = quote.summaryDetail || {};
    const defaultStats = quote.defaultKeyStatistics || {};
    const financialData = quote.financialData || {};

    return {
      per: summary.trailingPE || defaultStats.trailingPE || 0,
      pbr: defaultStats.priceToBook || 0,
      psr: defaultStats.priceToSalesTrailing12Months || 0,
      eps: defaultStats.trailingEps || 0,
      debtToEquity: financialData.debtToEquity ? financialData.debtToEquity / 100 : 0,
      currentRatio: financialData.currentRatio || 0,
    };
  }

  private extractProfitability(quote: any): ProfitabilityDto {
    const financialData = quote.financialData || {};
    const defaultStats = quote.defaultKeyStatistics || {};

    return {
      roe: financialData.returnOnEquity ? financialData.returnOnEquity * 100 : 0,
      roa: financialData.returnOnAssets ? financialData.returnOnAssets * 100 : 0,
      profitMargin: financialData.profitMargins ? financialData.profitMargins * 100 : 0,
      operatingMargin: financialData.operatingMargins ? financialData.operatingMargins * 100 : 0,
      ebitdaMargin: financialData.ebitdaMargins ? financialData.ebitdaMargins * 100 : 0,
    };
  }

  private extractGrowthMetrics(quote: any): GrowthMetricsDto {
    const financialData = quote.financialData || {};
    const defaultStats = quote.defaultKeyStatistics || {};

    return {
      revenueGrowth: financialData.revenueGrowth ? financialData.revenueGrowth * 100 : 0,
      earningsGrowth: financialData.earningsGrowth ? financialData.earningsGrowth * 100 : 0,
      epsGrowth: defaultStats.earningsQuarterlyGrowth ? defaultStats.earningsQuarterlyGrowth * 100 : 0,
      freeCashFlowGrowth: 0, // Yahoo Finance doesn't provide this directly
    };
  }

  private calculateValuation(quote: any, financials: FinancialMetricsDto): ValuationDto {
    const price = quote.price?.regularMarketPrice || 0;
    const targetPrice = quote.financialData?.targetMeanPrice || price;
    
    const upside = price > 0 ? ((targetPrice - price) / price) * 100 : 0;
    const isUndervalued = upside > 10; // 10% 이상 상승 여력이 있으면 저평가

    return {
      isUndervalued,
      fairValue: targetPrice,
      upside: Math.round(upside * 100) / 100,
    };
  }

  private calculateInvestmentScore(
    financials: FinancialMetricsDto,
    profitability: ProfitabilityDto,
    growth: GrowthMetricsDto,
    valuation: ValuationDto,
  ): InvestmentScoreDto {
    // 1. 재무 건전성 점수 (0-100)
    let financialScore = 0;
    if (financials.debtToEquity < 0.3) financialScore += 30;
    else if (financials.debtToEquity < 0.5) financialScore += 25;
    else if (financials.debtToEquity < 1.0) financialScore += 15;
    else if (financials.debtToEquity < 2.0) financialScore += 5;

    if (financials.currentRatio > 2.0) financialScore += 30;
    else if (financials.currentRatio > 1.5) financialScore += 25;
    else if (financials.currentRatio > 1.0) financialScore += 15;
    else if (financials.currentRatio > 0.5) financialScore += 5;

    if (financials.eps > 5) financialScore += 40;
    else if (financials.eps > 3) financialScore += 30;
    else if (financials.eps > 1) financialScore += 20;
    else if (financials.eps > 0) financialScore += 10;

    financialScore = Math.min(financialScore, 100);

    // 2. 성장성 점수 (0-100)
    let growthScore = 0;
    if (growth.revenueGrowth > 30) growthScore += 40;
    else if (growth.revenueGrowth > 20) growthScore += 30;
    else if (growth.revenueGrowth > 10) growthScore += 20;
    else if (growth.revenueGrowth > 5) growthScore += 10;
    else if (growth.revenueGrowth > 0) growthScore += 5;

    if (growth.earningsGrowth > 30) growthScore += 40;
    else if (growth.earningsGrowth > 20) growthScore += 30;
    else if (growth.earningsGrowth > 10) growthScore += 20;
    else if (growth.earningsGrowth > 5) growthScore += 10;
    else if (growth.earningsGrowth > 0) growthScore += 5;

    if (growth.epsGrowth > 20) growthScore += 20;
    else if (growth.epsGrowth > 10) growthScore += 15;
    else if (growth.epsGrowth > 5) growthScore += 10;
    else if (growth.epsGrowth > 0) growthScore += 5;

    growthScore = Math.min(growthScore, 100);

    // 3. 밸류에이션 점수 (0-100)
    let valuationScore = 0;
    if (financials.per > 0 && financials.per < 10) valuationScore += 30;
    else if (financials.per < 15) valuationScore += 25;
    else if (financials.per < 20) valuationScore += 20;
    else if (financials.per < 30) valuationScore += 10;
    else if (financials.per < 50) valuationScore += 5;

    if (financials.pbr < 1) valuationScore += 30;
    else if (financials.pbr < 2) valuationScore += 25;
    else if (financials.pbr < 3) valuationScore += 20;
    else if (financials.pbr < 5) valuationScore += 10;
    else if (financials.pbr < 10) valuationScore += 5;

    if (valuation.isUndervalued) valuationScore += 40;

    valuationScore = Math.min(valuationScore, 100);

    // 4. 수익성 점수 (0-100)
    let profitabilityScore = 0;
    if (profitability.roe > 25) profitabilityScore += 30;
    else if (profitability.roe > 20) profitabilityScore += 25;
    else if (profitability.roe > 15) profitabilityScore += 20;
    else if (profitability.roe > 10) profitabilityScore += 10;
    else if (profitability.roe > 5) profitabilityScore += 5;

    if (profitability.roa > 15) profitabilityScore += 20;
    else if (profitability.roa > 10) profitabilityScore += 15;
    else if (profitability.roa > 5) profitabilityScore += 10;
    else if (profitability.roa > 0) profitabilityScore += 5;

    if (profitability.profitMargin > 20) profitabilityScore += 30;
    else if (profitability.profitMargin > 15) profitabilityScore += 25;
    else if (profitability.profitMargin > 10) profitabilityScore += 20;
    else if (profitability.profitMargin > 5) profitabilityScore += 10;
    else if (profitability.profitMargin > 0) profitabilityScore += 5;

    if (profitability.operatingMargin > 20) profitabilityScore += 20;
    else if (profitability.operatingMargin > 15) profitabilityScore += 15;
    else if (profitability.operatingMargin > 10) profitabilityScore += 10;
    else if (profitability.operatingMargin > 5) profitabilityScore += 5;

    profitabilityScore = Math.min(profitabilityScore, 100);

    // 종합 점수 (가중 평균)
    const total = Math.round(
      financialScore * 0.25 +
      growthScore * 0.30 +
      valuationScore * 0.25 +
      profitabilityScore * 0.20
    );

    return {
      total,
      breakdown: {
        financial: Math.round(financialScore),
        growth: Math.round(growthScore),
        valuation: Math.round(valuationScore),
        profitability: Math.round(profitabilityScore),
      },
    };
  }

  private generateRecommendation(
    investmentScore: InvestmentScoreDto,
    financials: FinancialMetricsDto,
    profitability: ProfitabilityDto,
    growth: GrowthMetricsDto,
  ): { recommendation: InvestmentRecommendation; reasons: string[] } {
    const reasons: string[] = [];
    let recommendation: InvestmentRecommendation;

    // 점수에 따른 추천 등급
    if (investmentScore.total >= 80) {
      recommendation = InvestmentRecommendation.STRONG_BUY;
    } else if (investmentScore.total >= 65) {
      recommendation = InvestmentRecommendation.BUY;
    } else if (investmentScore.total >= 50) {
      recommendation = InvestmentRecommendation.HOLD;
    } else if (investmentScore.total >= 35) {
      recommendation = InvestmentRecommendation.SELL;
    } else {
      recommendation = InvestmentRecommendation.STRONG_SELL;
    }

    // 투자 근거 생성
    if (growth.revenueGrowth > 20) {
      reasons.push(`강력한 매출 성장 (${growth.revenueGrowth.toFixed(1)}%)`);
    }

    if (profitability.roe > 20) {
      reasons.push(`높은 자기자본이익률 (ROE ${profitability.roe.toFixed(1)}%)`);
    }

    if (financials.per > 0 && financials.per < 20) {
      reasons.push(`매력적인 밸류에이션 (PER ${financials.per.toFixed(1)})`);
    }

    if (financials.debtToEquity < 0.5) {
      reasons.push('건전한 재무구조 (낮은 부채비율)');
    }

    if (profitability.profitMargin > 15) {
      reasons.push(`우수한 수익성 (순이익률 ${profitability.profitMargin.toFixed(1)}%)`);
    }

    if (growth.earningsGrowth > 20) {
      reasons.push(`이익 고성장 (${growth.earningsGrowth.toFixed(1)}%)`);
    }

    // 부정적 요인
    if (financials.debtToEquity > 2.0) {
      reasons.push('⚠️ 높은 부채비율 주의');
    }

    if (financials.per > 50) {
      reasons.push('⚠️ 고평가 구간');
    }

    if (growth.revenueGrowth < 0) {
      reasons.push('⚠️ 매출 감소 추세');
    }

    // 최소 3개 이상의 근거 제공
    if (reasons.length === 0) {
      reasons.push('추가 분석이 필요합니다');
    }

      return { recommendation, reasons };
  }

  async getNewsSentiment(symbol: string): Promise<NewsSentimentDto> {
    try {
      this.logger.log(`Fetching news sentiment for ${symbol}...`);

  
      return await this.finnhubNewsService.getNewsSentiment(symbol);
    
    } catch (error) {
      this.logger.error(`Error fetching news sentiment for ${symbol}:`, error);
      throw error;
    }
  }
}

