import { Injectable, Logger } from '@nestjs/common';
import { EtfService } from '../etf/etf.service';
import { DataCollectorService } from './services/data-collector.service';
import { InvestmentAnalyzerService } from './services/investment-analyzer.service';
import { HiddenGemDto } from './dto/hidden-gem.dto';

@Injectable()
export class HiddenGemsService {
  private readonly logger = new Logger(HiddenGemsService.name);

  constructor(
    private readonly etfService: EtfService,
    private readonly dataCollector: DataCollectorService,
    private readonly investmentAnalyzer: InvestmentAnalyzerService,
  ) {}

  async discover(
    etf: string = 'all',
    minWeight: number = 0.1,
    maxWeight: number = 2.0,
    limit: number = 20,
  ): Promise<HiddenGemDto[]> {
    this.logger.log('Hidden gems discovery started', {
      etf,
      minWeight,
      maxWeight,
    });

    const etfSymbols =
      etf === 'all' ? ['ARKK', 'IVES', 'GRNY', 'AOTG'] : [etf];
    const hiddenGems: HiddenGemDto[] = [];

    for (const etfSymbol of etfSymbols) {
      try {
        const holdings = await this.etfService.getEtfHoldings(etfSymbol);

        const smallHoldings = holdings
          .filter((h) => h.weight >= minWeight && h.weight <= maxWeight)
          .sort((a, b) => a.weight - b.weight)
          .slice(0, 10);

        for (const holding of smallHoldings) {
          try {
            const comprehensiveData =
              await this.dataCollector.getComprehensiveAnalysis(holding.symbol);

            const investmentScore =
              this.investmentAnalyzer.calculateInvestmentScore(
                comprehensiveData,
                holding.weight,
              );

            const growthPotential =
              this.investmentAnalyzer.calculateGrowthPotential(
                comprehensiveData,
                investmentScore,
              );

            hiddenGems.push({
              symbol: holding.symbol,
              name: holding.name,
              etfSymbol,
              etfName: etfSymbol,
              weight: holding.weight,
              shares: holding.shares,
              currentPrice: comprehensiveData.quote?.price || 0,
              change: comprehensiveData.quote?.change || 0,
              changePercent: comprehensiveData.quote?.changePercent || 0,
              investmentScore,
              growthPotential,
              financial: comprehensiveData.financial,
              technical: comprehensiveData.technical,
              recentNews: comprehensiveData.news?.news.slice(0, 3) || [],
              sentimentScore: comprehensiveData.news?.sentimentScore || 50,
              analyzedAt: new Date().toISOString(),
            });

            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            this.logger.error(`Error analyzing ${holding.symbol}:`, error);
          }
        }
      } catch (error) {
        this.logger.error(`Error processing ETF ${etfSymbol}:`, error);
      }
    }

    hiddenGems.sort(
      (a, b) => b.investmentScore.totalScore - a.investmentScore.totalScore,
    );

    return hiddenGems.slice(0, limit);
  }

  async analyzeStock(symbol: string, etfWeight: number = 1.0) {
    this.logger.log(`Detailed analysis for ${symbol}`);

    const comprehensiveData =
      await this.dataCollector.getComprehensiveAnalysis(symbol);

    const investmentScore = this.investmentAnalyzer.calculateInvestmentScore(
      comprehensiveData,
      etfWeight,
    );

    const growthPotential = this.investmentAnalyzer.calculateGrowthPotential(
      comprehensiveData,
      investmentScore,
    );

    return {
      ...comprehensiveData,
      investmentScore,
      growthPotential,
    };
  }
}
