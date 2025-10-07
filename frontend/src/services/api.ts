import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API 응답 인터페이스
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}

// ETF 관련 타입
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

export interface MarketInsight {
  sector: string;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  description: string;
}

// API 함수들
export const etfApi = {
  // 모든 ETF 목록 조회
  getAllETFs: async (): Promise<ApiResponse<ETF[]>> => {
    const response = await api.get('/etf');
    return response.data;
  },

  // 특정 ETF 상세 정보 조회
  getETF: async (symbol: string): Promise<ApiResponse<ETF>> => {
    const response = await api.get(`/etf/${symbol}`);
    return response.data;
  },

  // 특정 ETF의 보유 종목 조회
  getETFHoldings: async (symbol: string): Promise<ApiResponse<Holding[]>> => {
    const response = await api.get(`/etf/${symbol}/holdings`);
    return response.data;
  },

  // 특정 종목의 상세 정보 조회
  getStockData: async (symbol: string): Promise<ApiResponse<StockData>> => {
    const response = await api.get(`/etf/stock/${symbol}`);
    return response.data;
  },
};

export const analysisApi = {
  // 성장주 분석 결과 조회
  getGrowthStocks: async (limit?: number, minScore?: number): Promise<ApiResponse<GrowthStock[]>> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (minScore) params.append('minScore', minScore.toString());
    
    const response = await api.get(`/analysis/growth-stocks?${params}`);
    return response.data;
  },

  // 특정 ETF의 성장주 분석
  getETFGrowthStocks: async (symbol: string, limit?: number): Promise<ApiResponse<any[]>> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const response = await api.get(`/analysis/etf/${symbol}/growth-stocks?${params}`);
    return response.data;
  },

  // 시장 인사이트 조회
  getMarketInsights: async (): Promise<ApiResponse<MarketInsight[]>> => {
    const response = await api.get('/analysis/market-insights');
    return response.data;
  },

  // 포트폴리오 분석
  analyzePortfolio: async (symbols: string[]): Promise<ApiResponse<any[]>> => {
    const response = await api.post('/analysis/portfolio-analysis', { symbols });
    return response.data;
  },
};

export default api;
