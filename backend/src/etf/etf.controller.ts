import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EtfDto, HoldingDto } from './dto/etf.dto';
import { EtfService } from './etf.service';
import { EtfSymbol } from './type/symbol';

@ApiTags('etf')
@Controller('etf')
export class EtfController {
  constructor(private readonly etfService: EtfService) {}

  @Get()
  @ApiOperation({ summary: '모든 ETF 목록 조회' })
  @ApiResponse({ status: 200, description: 'ETF 목록', type: [EtfDto] })
  async getAllEtfs() {
    const data = await this.etfService.getAllEtfs();
    return {
      success: true,
      data,
      count: data.length,
    };
  }

  @Get(':symbol')
  @ApiOperation({ summary: '특정 ETF 상세 정보 조회' })
  @ApiParam({ name: 'symbol', example: 'ARKK' })
  @ApiResponse({ status: 200, description: 'ETF 상세 정보', type: EtfDto })
  async getEtf(@Param('symbol') symbol: EtfSymbol) {
    const data = await this.etfService.getEtfOverview(symbol);
    return {
      success: true,
      data,
    };
  }

  @Get(':symbol/holdings')
  @ApiOperation({ summary: '특정 ETF의 보유 종목 조회' })
  @ApiParam({ name: 'symbol', example: 'ARKK' })
  @ApiResponse({ status: 200, description: '보유 종목 목록', type: [HoldingDto] })
  async getEtfHoldings(@Param('symbol') symbol: EtfSymbol) {
    const data = await this.etfService.getEtfHoldings(symbol);
    return {
      success: true,
      data,
      count: data.length,
    };
  }
}
