export interface ETF {
  id: string;
  symbol: string;
  name: string;
  description: string;
  expenseRatio: number;
  totalAssets: number;
  inceptionDate: string;
  lastUpdated: string;
}

export interface Holding {
  id: string;
  etfId: string;
  symbol: string;
  name: string;
  weight: number;
  shares: number;
  marketValue: number;
  lastUpdated: string;
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume: number;
  changePercent: number;
  pe: number;
  pb: number;
  roe: number;
  debtToEquity: number;
  revenueGrowth: number;
  earningsGrowth: number;
  lastUpdated: string;
}

export interface GrowthStock {
  symbol: string;
  name: string;
  score: number;
  reasons: string[];
  etfExposure: ETFExposure[];
  metrics: {
    marketCap: number;
    pe: number;
    revenueGrowth: number;
    earningsGrowth: number;
    roe: number;
  };
  lastUpdated: string;
}

export interface ETFExposure {
  etfSymbol: string;
  etfName: string;
  weight: number;
  position: 'top' | 'middle' | 'bottom';
}

export interface AnalysisResult {
  topGrowthStocks: GrowthStock[];
  etfSummary: {
    symbol: string;
    name: string;
    totalHoldings: number;
    topHoldings: Holding[];
    bottomHoldings: Holding[];
  }[];
  marketInsights: {
    sector: string;
    trend: 'up' | 'down' | 'stable';
    confidence: number;
    description: string;
  }[];
  lastUpdated: string;
}

export interface DataCollectionStatus {
  etfSymbol: string;
  status: 'success' | 'error' | 'in_progress';
  lastRun: string;
  nextRun: string;
  errorMessage?: string;
}
