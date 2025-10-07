import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';

@ApiTags('analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('market-insights')
  @ApiOperation({ summary: '시장 인사이트 조회' })
  @ApiResponse({ status: 200, description: '시장 인사이트' })
  getMarketInsights() {
    const data = this.analysisService.getMarketInsights();
    return {
      success: true,
      data,
      count: data.length,
      lastUpdated: new Date().toISOString(),
    };
  }
}
