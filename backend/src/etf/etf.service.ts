import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { parse } from 'csv-parse/sync';
import { EtfDto, EtfWithHoldingsDto, HoldingDto } from './dto/etf.dto';
import { EtfSymbol } from './type/symbol';

interface EtfHolding {
  ticker: string;
  name: string;
  weightPct: number;
  shares: number;
  marketValue: number;
}


@Injectable()
export class EtfService {
  private readonly logger = new Logger(EtfService.name);

  protected readonly ETF_CONFIGS = {
    ARKK: {
      symbol: 'ARKK',
      name: 'ARK Innovation ETF',
      description: 'ARK Innovation ETF seeks long-term growth of capital by investing in companies that benefit from disruptive innovation',
      expenseRatio: 0.75,
      inceptionDate: '2014-10-31',
    },
    IVES: {
      symbol: 'IVES',
      name: 'Dan IVES Wedbush AI Revolution ETF',
      description: 'AI Revolution ETF focusing on artificial intelligence companies',
      expenseRatio: 0.75,
      inceptionDate: '2023-01-01',
    },
    GRNY: {
      symbol: 'GRNY',
      name: 'Fundstrat Granny Shots US 대형주 ETF',
      description: 'Large-cap US growth stocks ETF',
      expenseRatio: 0.75,
      inceptionDate: '2023-01-01',
    },
    AOTG: {
      symbol: 'AOTG',
      name: 'AOT 성장 및 혁신 ETF',
      description: 'Growth and Innovation ETF',
      expenseRatio: 0.75,
      inceptionDate: '2023-01-01',
    },
  };

  async getAllEtfs(): Promise<EtfDto[]> {
    const etfSymbols = Object.keys(this.ETF_CONFIGS) as EtfSymbol[];
    const etfs: EtfDto[] = [];

    for (const symbol of etfSymbols) {
      try {
        const etf = await this.getEtfOverview(symbol);
        etfs.push(etf);
      } catch (error) {
        this.logger.error(`Error getting ETF ${symbol}:`, error);
      }
    }

    return etfs;
  }

  async getEtfOverview(symbol: EtfSymbol): Promise<EtfDto> {
    const config = this.ETF_CONFIGS[symbol];
    if (!config) {
      throw new Error(`ETF ${symbol} not found`);
    }

    return {
      id: symbol,
      symbol: symbol,
      name: config.name,
      description: config.description,
      expenseRatio: config.expenseRatio,
      totalAssets: 0, // Placeholder for total assets
      inceptionDate: config.inceptionDate,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getEtfHoldings(symbol: EtfSymbol): Promise<HoldingDto[]> {
    const holdings = await this.fetchEtfHoldings(symbol);
    return holdings.map((holding, index) => ({
      id: `${symbol}-${index}`,
      etfId: symbol,
      symbol: holding.ticker,
      name: holding.name,
      weight: holding.weightPct,
      shares: holding.shares,
      marketValue: holding.marketValue,
      lastUpdated: new Date().toISOString(),
    }));
  }

  async getAllEtfsWithHoldings(): Promise<EtfWithHoldingsDto[]> {
    const etfSymbols = Object.keys(this.ETF_CONFIGS) as EtfSymbol[];
    const results: EtfWithHoldingsDto[] = [];

    for (const symbol of etfSymbols) {
      try {
        const config = this.ETF_CONFIGS[symbol];
        const holdings = await this.getEtfHoldings(symbol);

        results.push({
          symbol: symbol,
          name: config.name,
          expenseRatio: config.expenseRatio,
          holdings: holdings,
        });
      } catch (error) {
        this.logger.error(`Error fetching holdings for ${symbol}:`, error);
      }
    }

    return results;
  }

  async fetchEtfHoldings(symbol: EtfSymbol): Promise<EtfHolding[]> {
    this.logger.log(`Fetching holdings for ${symbol}...`);
    try {
      if (symbol.startsWith('ARK')) {
        return await this.fetchArkHoldings(symbol);
      } else {
        return await this.fetchCsvHoldings(symbol);
      }
    } catch (error) {
      this.logger.error(`Error fetching holdings for ${symbol}:`, error);
      throw error;
    }
  }

  private async fetchArkHoldings(symbol: string): Promise<EtfHolding[]> {
    const url = `https://arkfunds.io/api/v1/etf/holdings?symbol=${symbol}`;
    const response = await axios.get(url);
    const holdings = response.data.holdings;

    return holdings.map((holding: any) => ({
      ticker: holding.ticker,
      name: holding.name,
      weightPct: holding.weight,
      shares: holding.shares,
      marketValue: holding.market_value,
    }));
  }

  private async fetchCsvHoldings(symbol: string): Promise<EtfHolding[]> {
    const csvUrls: { [key: string]: string } = {
      IVV: 'https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf/1467271812596.ajax?fileType=csv&fileName=IVV_holdings&dataType=fund',
      VOO: 'https://investor.vanguard.com/investment-products/etfs/profile/voo',
      SPY: 'https://www.ssga.com/us/en/individual/etfs/funds/spdr-sp-500-etf-trust-spy',
    };

    const url = csvUrls[symbol];
    if (!url) {
      throw new Error(`CSV URL not found for ETF ${symbol}`);
    }

    const response = await axios.get(url);
    const records = parse(response.data, {
      columns: true,
      skip_empty_lines: true,
    });

    return records.map((record: any) => ({
      ticker: record['Ticker'] || record['Symbol'],
      name: record['Name'] || record['Company Name'],
      weightPct: parseFloat(record['Weight'] || record['WeightPct']),
      shares: parseInt(record['Shares'], 10),
      marketValue: parseFloat(record['Market Value'] || record['MarketValue']),
    }));
  }
}
