import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { HiddenGemsService } from './hidden-gems.service';
import { HiddenGemDto, DiscoverQueryDto } from './dto/hidden-gem.dto';

@ApiTags('hidden-gems')
@Controller('hidden-gems')
export class HiddenGemsController {
  constructor(private readonly hiddenGemsService: HiddenGemsService) {}

  @Get('discover')
  @ApiOperation({ summary: '숨은 보석 발굴 - 소량 보유 종목 분석' })
  @ApiQuery({ name: 'etf', required: false, example: 'ARKK' })
  @ApiQuery({ name: 'minWeight', required: false, example: 0.1 })
  @ApiQuery({ name: 'maxWeight', required: false, example: 2.0 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: '숨은 보석 목록', type: [HiddenGemDto] })
  async discover(@Query() query: DiscoverQueryDto) {
    const { etf = 'all', minWeight = 0.1, maxWeight = 2.0, limit = 20 } = query;

    const data = await this.hiddenGemsService.discover(
      etf,
      Number(minWeight),
      Number(maxWeight),
      Number(limit),
    );

    return {
      success: true,
      data,
      count: data.length,
      filters: {
        etf,
        minWeight: Number(minWeight),
        maxWeight: Number(maxWeight),
      },
      analyzedAt: new Date().toISOString(),
    };
  }

  @Get('analyze/:symbol')
  @ApiOperation({ summary: '특정 종목 상세 분석' })
  @ApiParam({ name: 'symbol', example: 'TSLA' })
  @ApiQuery({ name: 'etfWeight', required: false, example: 0.5 })
  @ApiResponse({ status: 200, description: '종목 상세 분석' })
  async analyze(
    @Param('symbol') symbol: string,
    @Query('etfWeight') etfWeight: number = 1.0,
  ) {
    const data = await this.hiddenGemsService.analyzeStock(
      symbol.toUpperCase(),
      Number(etfWeight),
    );

    return {
      success: true,
      data,
    };
  }
}
