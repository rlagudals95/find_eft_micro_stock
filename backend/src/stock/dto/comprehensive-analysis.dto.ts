import { ApiProperty } from '@nestjs/swagger';

// 뉴스 감성 분석
export class NewsSentimentDto {
  @ApiProperty({ description: '뉴스 감성 점수 (-1 ~ 1)', example: 0.65 })
  score: number;

  @ApiProperty({ description: '긍정 뉴스 비율 (%)', example: 70 })
  positiveRatio: number;

  @ApiProperty({ description: '최근 7일 뉴스 수', example: 15 })
  newsCount: number;

  @ApiProperty({ description: '주요 키워드', example: ['AI', '실적 개선', '신제품'] })
  keywords: string[];

  @ApiProperty({ description: '최신 뉴스 3개' })
  recentNews: Array<{
    title: string;
    source: string;
    publishedAt: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    url: string;
  }>;
}

// 기술적 분석
export class TechnicalAnalysisDto {
  @ApiProperty({ description: 'RSI 지표 (0-100)', example: 65 })
  rsi: number;

  @ApiProperty({ description: 'MACD 신호', example: 'bullish' })
  macdSignal: 'bullish' | 'bearish' | 'neutral';

  @ApiProperty({ description: '이동평균선 상태' })
  movingAverages: {
    ma20: number;
    ma50: number;
    ma200: number;
    signal: 'golden_cross' | 'death_cross' | 'neutral';
  };

  @ApiProperty({ description: '추세 강도 (0-100)', example: 75 })
  trendStrength: number;

  @ApiProperty({ description: '거래량 분석' })
  volumeAnalysis: {
    averageVolume: number;
    currentVolume: number;
    volumeTrend: 'increasing' | 'decreasing' | 'stable';
  };

  @ApiProperty({ description: '지지선/저항선' })
  supportResistance: {
    support: number[];
    resistance: number[];
  };
}

// 섹터 & 산업 분석
export class SectorAnalysisDto {
  @ApiProperty({ description: '섹터 성과 (YTD %)', example: 15.5 })
  sectorPerformance: number;

  @ApiProperty({ description: '섹터 내 순위', example: 3 })
  rankInSector: number;

  @ApiProperty({ description: '섹터 내 기업 수', example: 50 })
  totalInSector: number;

  @ApiProperty({ description: '산업 성장률 (%)', example: 25.3 })
  industryGrowthRate: number;

  @ApiProperty({ description: '시장 점유율 (%)', example: 8.5 })
  marketShare: number;

  @ApiProperty({ description: '경쟁사 비교' })
  competitors: Array<{
    symbol: string;
    name: string;
    marketCap: number;
    growthRate: number;
  }>;
}

// 경영진 & 내부자 분석
export class InsiderAnalysisDto {
  @ApiProperty({ description: 'CEO 이름', example: 'Elon Musk' })
  ceo: string;

  @ApiProperty({ description: 'CEO 재임 기간 (년)', example: 15 })
  ceoTenure: number;

  @ApiProperty({ description: '최근 3개월 내부자 거래' })
  insiderTrading: {
    buyTransactions: number;
    sellTransactions: number;
    netShares: number;
    signal: 'bullish' | 'bearish' | 'neutral';
  };

  @ApiProperty({ description: '주요 임원진' })
  executives: Array<{
    name: string;
    position: string;
    background: string;
  }>;

  @ApiProperty({ description: '이사회 독립성 (%)', example: 75 })
  boardIndependence: number;
}

// 계약 & 공시 분석
export class CorporateEventsDto {
  @ApiProperty({ description: '최근 3개월 주요 공시' })
  recentFilings: Array<{
    type: string;
    description: string;
    date: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;

  @ApiProperty({ description: '진행 중인 계약' })
  contracts: Array<{
    partner: string;
    value: number;
    description: string;
    date: string;
  }>;

  @ApiProperty({ description: '특허 현황' })
  patents: {
    total: number;
    granted: number;
    pending: number;
  };

  @ApiProperty({ description: 'M&A 활동' })
  mnaActivity: Array<{
    type: 'acquisition' | 'merger';
    target: string;
    value: number;
    status: string;
  }>;
}

// AI 종합 분석 결과
export class AIAnalysisDto {
  @ApiProperty({ description: 'AI 종합 점수 (0-100)', example: 82 })
  overallScore: number;

  @ApiProperty({ description: '투자 추천', example: 'STRONG_BUY' })
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';

  @ApiProperty({ description: '신뢰도 (%)', example: 85 })
  confidence: number;

  @ApiProperty({ description: '세부 점수 분석' })
  breakdown: {
    fundamental: number;      // 재무 분석 (기존)
    technical: number;         // 기술적 분석
    sentiment: number;         // 뉴스 감성
    sector: number;           // 섹터 강도
    insider: number;          // 내부자 신호
    events: number;           // 기업 이벤트
  };

  @ApiProperty({ description: '주요 강점' })
  strengths: string[];

  @ApiProperty({ description: '주요 약점' })
  weaknesses: string[];

  @ApiProperty({ description: '위험 요소' })
  risks: string[];

  @ApiProperty({ description: '기회 요소' })
  opportunities: string[];

  @ApiProperty({ description: 'AI 추론' })
  aiReasoning: string;
}

// 종합 분석 결과
export class ComprehensiveAnalysisDto {
  @ApiProperty({ description: '기본 재무 분석' })
  fundamental: any; // 기존 StockAnalysisDto

  @ApiProperty({ description: '뉴스 감성 분석' })
  newsSentiment: NewsSentimentDto;

  @ApiProperty({ description: '기술적 분석' })
  technical: TechnicalAnalysisDto;

  @ApiProperty({ description: '섹터 분석' })
  sector: SectorAnalysisDto;

  @ApiProperty({ description: '내부자 분석' })
  insider: InsiderAnalysisDto;

  @ApiProperty({ description: '기업 이벤트' })
  events: CorporateEventsDto;

  @ApiProperty({ description: 'AI 종합 분석' })
  aiAnalysis: AIAnalysisDto;

  @ApiProperty({ description: '투자 시나리오' })
  scenarios: {
    bullish: {
      probability: number;
      targetPrice: number;
      timeframe: string;
      conditions: string[];
    };
    base: {
      probability: number;
      targetPrice: number;
      timeframe: string;
      conditions: string[];
    };
    bearish: {
      probability: number;
      targetPrice: number;
      timeframe: string;
      conditions: string[];
    };
  };
}

