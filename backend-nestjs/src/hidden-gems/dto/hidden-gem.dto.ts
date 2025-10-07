import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class InvestmentScoreDto {
  @ApiProperty({ example: 85, description: '총 투자 점수 (0-100)' })
  @IsNumber()
  totalScore: number;

  @ApiProperty({ example: '🌟🌟', description: '등급' })
  @IsString()
  grade: string;

  @ApiProperty({ example: 'Buy', description: '투자 의견' })
  @IsString()
  rating: string;

  @ApiProperty({ description: '점수 상세' })
  @IsObject()
  breakdown: {
    discoveryScore: number;
    financialScore: number;
    growthScore: number;
    valuationScore: number;
    momentumScore: number;
  };

  @ApiProperty({ description: '강점', type: [String] })
  @IsArray()
  strengths: string[];

  @ApiProperty({ description: '약점', type: [String] })
  @IsArray()
  weaknesses: string[];

  @ApiProperty({ description: '투자 추천' })
  @IsString()
  recommendation: string;
}

export class GrowthPotentialDto {
  @ApiProperty({ example: 5.2, description: '1개월 예상 수익률 (%)' })
  @IsNumber()
  oneMonthPrediction: number;

  @ApiProperty({ example: 15.8, description: '3개월 예상 수익률 (%)' })
  @IsNumber()
  threeMonthPrediction: number;

  @ApiProperty({ example: 75, description: '신뢰도 (%)' })
  @IsNumber()
  confidence: number;

  @ApiProperty({ example: 285.5, description: '목표 주가' })
  @IsNumber()
  targetPrice: number;

  @ApiProperty({ example: 15.8, description: '상승 여력 (%)' })
  @IsNumber()
  upside: number;

  @ApiProperty({ description: '리스크', type: [String] })
  @IsArray()
  risks: string[];

  @ApiProperty({ description: '촉매제', type: [String] })
  @IsArray()
  catalysts: string[];
}

export class HiddenGemDto {
  @ApiProperty({ example: 'TSLA', description: '종목 심볼' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 'Tesla Inc', description: '회사명' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ARKK', description: 'ETF 심볼' })
  @IsString()
  etfSymbol: string;

  @ApiProperty({ example: 'ARK Innovation ETF', description: 'ETF 이름' })
  @IsString()
  etfName: string;

  @ApiProperty({ example: 0.5, description: 'ETF 내 보유 비중 (%)' })
  @IsNumber()
  weight: number;

  @ApiProperty({ example: 50000, description: '보유 주식 수' })
  @IsNumber()
  shares: number;

  @ApiProperty({ example: 256.69, description: '현재 주가' })
  @IsNumber()
  currentPrice: number;

  @ApiProperty({ example: 17, description: '가격 변동' })
  @IsNumber()
  change: number;

  @ApiProperty({ example: 7.09, description: '가격 변동률 (%)' })
  @IsNumber()
  changePercent: number;

  @ApiProperty({ description: '투자 점수', type: InvestmentScoreDto })
  @IsObject()
  investmentScore: InvestmentScoreDto;

  @ApiProperty({ description: '상승 가능성', type: GrowthPotentialDto })
  @IsObject()
  growthPotential: GrowthPotentialDto;

  @ApiProperty({ description: '재무 데이터' })
  @IsOptional()
  @IsObject()
  financial?: any;

  @ApiProperty({ description: '기술적 지표' })
  @IsOptional()
  @IsObject()
  technical?: any;

  @ApiProperty({ description: '최근 뉴스', type: [Object] })
  @IsOptional()
  @IsArray()
  recentNews?: any[];

  @ApiProperty({ example: 65, description: '센티먼트 점수 (0-100)' })
  @IsOptional()
  @IsNumber()
  sentimentScore?: number;

  @ApiProperty({ description: '분석 시간' })
  @IsString()
  analyzedAt: string;
}

export class DiscoverQueryDto {
  @ApiProperty({ example: 'ARKK', description: 'ETF 심볼 (all for all ETFs)', required: false })
  @IsOptional()
  @IsString()
  etf?: string = 'all';

  @ApiProperty({ example: 0.1, description: '최소 보유 비중 (%)', required: false })
  @IsOptional()
  @IsNumber()
  minWeight?: number = 0.1;

  @ApiProperty({ example: 2.0, description: '최대 보유 비중 (%)', required: false })
  @IsOptional()
  @IsNumber()
  maxWeight?: number = 2.0;

  @ApiProperty({ example: 20, description: '결과 개수 제한', required: false })
  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}
