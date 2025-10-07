import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { EtfDto, HoldingDto } from './dto/etf.dto';

@Injectable()
export class EtfService {
  private readonly logger = new Logger(EtfService.name);

  private readonly ETF_CONFIGS = {
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
    const etfSymbols = Object.keys(this.ETF_CONFIGS);
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

  async getEtfOverview(symbol: string): Promise<EtfDto> {
    const config = this.ETF_CONFIGS[symbol];
    if (!config) {
      throw new Error(`ETF ${symbol} not found`);
    }

    try {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      );
      const data = response.data.chart.result[0];
      const meta = data?.meta || {};

      return {
        id: symbol,
        symbol: symbol,
        name: config.name,
        description: config.description,
        expenseRatio: config.expenseRatio,
        totalAssets: meta.marketCap || 0,
        inceptionDate: config.inceptionDate,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error getting ETF overview for ${symbol}:`, error);
      throw error;
    }
  }

  async getEtfHoldings(symbol: string): Promise<HoldingDto[]> {
    const mockHoldings = {
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
        { symbol: 'SNOW', name: 'Snowflake Inc', weight: 1.8, shares: 150000 },
        { symbol: 'SHOP', name: 'Shopify Inc', weight: 1.5, shares: 120000 },
        { symbol: 'PATH', name: 'UiPath Inc', weight: 1.2, shares: 100000 },
        { symbol: 'DKNG', name: 'DraftKings Inc', weight: 0.9, shares: 80000 },
        { symbol: 'TWLO', name: 'Twilio Inc', weight: 0.7, shares: 60000 },
        { symbol: 'U', name: 'Unity Software Inc', weight: 0.5, shares: 50000 },
        { symbol: 'EXAS', name: 'Exact Sciences Corp', weight: 0.4, shares: 40000 },
        { symbol: 'PACB', name: 'Pacific Biosciences', weight: 0.3, shares: 30000 },
        { symbol: 'NTLA', name: 'Intellia Therapeutics', weight: 0.2, shares: 20000 },
        { symbol: 'BEAM', name: 'Beam Therapeutics', weight: 0.15, shares: 15000 },
        { symbol: 'VERV', name: 'Verve Therapeutics', weight: 0.1, shares: 10000 },
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
        { symbol: 'ORCL', name: 'Oracle Corporation', weight: 3.5, shares: 350000 },
        { symbol: 'NOW', name: 'ServiceNow Inc', weight: 2.8, shares: 300000 },
        { symbol: 'PANW', name: 'Palo Alto Networks', weight: 2.1, shares: 250000 },
        { symbol: 'SNPS', name: 'Synopsys Inc', weight: 1.5, shares: 200000 },
        { symbol: 'CDNS', name: 'Cadence Design Systems', weight: 1.2, shares: 150000 },
        { symbol: 'FTNT', name: 'Fortinet Inc', weight: 0.8, shares: 100000 },
        { symbol: 'DDOG', name: 'Datadog Inc', weight: 0.6, shares: 80000 },
        { symbol: 'NET', name: 'Cloudflare Inc', weight: 0.4, shares: 60000 },
        { symbol: 'S', name: 'SentinelOne Inc', weight: 0.3, shares: 40000 },
        { symbol: 'AI', name: 'C3.ai Inc', weight: 0.2, shares: 30000 },
        { symbol: 'BBAI', name: 'BigBear.ai Holdings', weight: 0.1, shares: 20000 },
      ],
      GRNY: [
        { symbol: 'AAPL', name: 'Apple Inc', weight: 10.5, shares: 1500000 },
        { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 9.8, shares: 1400000 },
        { symbol: 'GOOGL', name: 'Alphabet Inc', weight: 8.5, shares: 1200000 },
        { symbol: 'AMZN', name: 'Amazon.com Inc', weight: 7.2, shares: 1000000 },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 6.8, shares: 900000 },
        { symbol: 'META', name: 'Meta Platforms Inc', weight: 5.5, shares: 800000 },
        { symbol: 'BRK.B', name: 'Berkshire Hathaway', weight: 4.8, shares: 700000 },
        { symbol: 'JPM', name: 'JPMorgan Chase', weight: 3.5, shares: 600000 },
        { symbol: 'V', name: 'Visa Inc', weight: 2.8, shares: 500000 },
        { symbol: 'UNH', name: 'UnitedHealth Group', weight: 2.1, shares: 400000 },
      ],
      AOTG: [
        { symbol: 'TSLA', name: 'Tesla Inc', weight: 9.5, shares: 1100000 },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 8.2, shares: 1000000 },
        { symbol: 'SHOP', name: 'Shopify Inc', weight: 6.8, shares: 800000 },
        { symbol: 'SQ', name: 'Block Inc', weight: 5.5, shares: 700000 },
        { symbol: 'COIN', name: 'Coinbase Global Inc', weight: 4.2, shares: 600000 },
        { symbol: 'RBLX', name: 'Roblox Corporation', weight: 3.5, shares: 500000 },
        { symbol: 'DKNG', name: 'DraftKings Inc', weight: 2.8, shares: 400000 },
        { symbol: 'HOOD', name: 'Robinhood Markets', weight: 2.1, shares: 300000 },
        { symbol: 'SOFI', name: 'SoFi Technologies', weight: 1.5, shares: 200000 },
        { symbol: 'UPST', name: 'Upstart Holdings', weight: 1.2, shares: 150000 },
        { symbol: 'AFRM', name: 'Affirm Holdings', weight: 0.8, shares: 100000 },
        { symbol: 'OPEN', name: 'Opendoor Technologies', weight: 0.5, shares: 80000 },
        { symbol: 'LCID', name: 'Lucid Group Inc', weight: 0.3, shares: 60000 },
        { symbol: 'RIVN', name: 'Rivian Automotive', weight: 0.2, shares: 40000 },
        { symbol: 'IONQ', name: 'IonQ Inc', weight: 0.1, shares: 20000 },
      ],
    };

    const holdingsData = mockHoldings[symbol] || [];

    return holdingsData.map((holding, index) => ({
      id: `${symbol}-${index}`,
      etfId: symbol,
      symbol: holding.symbol,
      name: holding.name,
      weight: holding.weight,
      shares: holding.shares,
      marketValue: 0,
      lastUpdated: new Date().toISOString(),
    }));
  }
}
