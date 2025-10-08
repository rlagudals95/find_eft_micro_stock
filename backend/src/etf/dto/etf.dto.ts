import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString } from 'class-validator';
import { EtfSymbol } from '../type/symbol';

export class EtfDto {
  @ApiProperty({ example: 'ARKK', description: 'ETF 심볼' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'ARKK', description: 'ETF 심볼' })
  @IsString()
  symbol: EtfSymbol;

  @ApiProperty({ example: 'ARK Innovation ETF', description: 'ETF 이름' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'ETF 설명' })
  @IsString()
  description: string;

  @ApiProperty({ example: 0.75, description: '수수료 비율 (%)' })
  @IsNumber()
  expenseRatio: number;

  @ApiProperty({ example: 5000000000, description: '총 자산' })
  @IsNumber()
  totalAssets: number;

  @ApiProperty({ example: '2014-10-31', description: '설립일' })
  @IsDateString()
  inceptionDate: string;

  @ApiProperty({ description: '마지막 업데이트' })
  @IsDateString()
  lastUpdated: string;
}

export class HoldingDto {
  @ApiProperty({ example: 'ARKK-0', description: '보유 종목 ID' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'ARKK', description: 'ETF ID' })
  @IsString()
  etfId: string;

  @ApiProperty({ example: 'TSLA', description: '종목 심볼' })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 'Tesla Inc', description: '회사명' })
  @IsString()
  name: string;

  @ApiProperty({ example: 8.5, description: '보유 비중 (%)' })
  @IsNumber()
  weight: number;

  @ApiProperty({ example: 1000000, description: '보유 주식 수' })
  @IsNumber()
  shares: number;

  @ApiProperty({ example: 250000000, description: '시장 가치' })
  @IsNumber()
  marketValue: number;

  @ApiProperty({ description: '마지막 업데이트' })
  @IsDateString()
  lastUpdated: string;
}
