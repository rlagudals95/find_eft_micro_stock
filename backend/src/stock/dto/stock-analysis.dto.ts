import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export enum InvestmentRecommendation {
  STRONG_BUY = 'STRONG_BUY',
  BUY = 'BUY',
  HOLD = 'HOLD',
  SELL = 'SELL',
  STRONG_SELL = 'STRONG_SELL',
}

export class BasicInfoDto {
  @ApiProperty({ example: 'TSLA', description: '종목 심볼' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 'Tesla, Inc.', description: '회사명' })
  @IsString()
  name: string;

  @ApiProperty({ example: 250.50, description: '현재 주가' })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 800000000000, description: '시가총액' })
  @IsNumber()
  marketCap: number;

  @ApiProperty({ example: 'Technology', description: '섹터' })
  @IsString()
  sector: string;

  @ApiProperty({ example: 'Auto Manufacturers', description: '산업' })
  @IsString()
  industry: string;

  @ApiProperty({ example: 'United States', description: '국가' })
  @IsString()
  country: string;
}

export class FinancialMetricsDto {
  @ApiProperty({ example: 25.5, description: 'PER (주가수익비율)' })
  @IsNumber()
  per: number;

  @ApiProperty({ example: 3.2, description: 'PBR (주가순자산비율)' })
  @IsNumber()
  pbr: number;

  @ApiProperty({ example: 5.8, description: 'PSR (주가매출비율)' })
  @IsNumber()
  psr: number;

  @ApiProperty({ example: 5.25, description: 'EPS (주당순이익)' })
  @IsNumber()
  eps: number;

  @ApiProperty({ example: 0.35, description: '부채비율 (Debt to Equity)' })
  @IsNumber()
  debtToEquity: number;

  @ApiProperty({ example: 1.8, description: '유동비율 (Current Ratio)' })
  @IsNumber()
  currentRatio: number;
}

export class ProfitabilityDto {
  @ApiProperty({ example: 28.5, description: 'ROE (자기자본이익률) %' })
  @IsNumber()
  roe: number;

  @ApiProperty({ example: 12.3, description: 'ROA (총자산이익률) %' })
  @IsNumber()
  roa: number;

  @ApiProperty({ example: 15.8, description: '순이익률 %' })
  @IsNumber()
  profitMargin: number;

  @ApiProperty({ example: 18.5, description: '영업이익률 %' })
  @IsNumber()
  operatingMargin: number;

  @ApiProperty({ example: 22.3, description: 'EBITDA 마진 %' })
  @IsNumber()
  ebitdaMargin: number;
}

export class GrowthMetricsDto {
  @ApiProperty({ example: 45.2, description: '매출 성장률 (YoY) %' })
  @IsNumber()
  revenueGrowth: number;

  @ApiProperty({ example: 52.8, description: '이익 성장률 (YoY) %' })
  @IsNumber()
  earningsGrowth: number;

  @ApiProperty({ example: 48.5, description: 'EPS 성장률 %' })
  @IsNumber()
  epsGrowth: number;

  @ApiProperty({ example: 38.2, description: '잉여현금흐름 성장률 %' })
  @IsNumber()
  freeCashFlowGrowth: number;
}

export class ValuationDto {
  @ApiProperty({ example: true, description: '저평가 여부' })
  isUndervalued: boolean;

  @ApiProperty({ example: 300.0, description: '적정 주가' })
  @IsNumber()
  fairValue: number;

  @ApiProperty({ example: 20.5, description: '상승 여력 %' })
  @IsNumber()
  upside: number;
}

export class InvestmentScoreDto {
  @ApiProperty({ example: 85, description: '종합 투자 점수 (0-100)' })
  @IsNumber()
  total: number;

  @ApiProperty({ 
    example: { financial: 90, growth: 85, valuation: 80, profitability: 85 },
    description: '세부 점수 분석'
  })
  breakdown: {
    financial: number;      // 재무 건전성
    growth: number;         // 성장성
    valuation: number;      // 밸류에이션
    profitability: number;  // 수익성
  };
}

export class StockAnalysisDto {
  @ApiProperty({ type: BasicInfoDto })
  basic: BasicInfoDto;

  @ApiProperty({ type: FinancialMetricsDto })
  financials: FinancialMetricsDto;

  @ApiProperty({ type: ProfitabilityDto })
  profitability: ProfitabilityDto;

  @ApiProperty({ type: GrowthMetricsDto })
  growth: GrowthMetricsDto;

  @ApiProperty({ type: ValuationDto })
  valuation: ValuationDto;

  @ApiProperty({ type: InvestmentScoreDto })
  investmentScore: InvestmentScoreDto;

  @ApiProperty({ 
    enum: InvestmentRecommendation,
    example: InvestmentRecommendation.BUY,
    description: '투자 추천'
  })
  @IsEnum(InvestmentRecommendation)
  recommendation: InvestmentRecommendation;

  @ApiProperty({ 
    example: ['강력한 매출 성장', '낮은 PER', '높은 ROE'],
    description: '투자 근거'
  })
  reasons: string[];

  @ApiProperty({ description: '마지막 업데이트 시간' })
  lastUpdated: string;
}

