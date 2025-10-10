import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NewsSentimentDto } from './dto/news-sentiment.dto';
import { StockAnalysisDto } from './dto/stock-analysis.dto';
import { StockService } from './stock.service';

@ApiTags('stock')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get(':symbol/analysis')
  @ApiOperation({ summary: '주식 상세 분석 조회' })
  @ApiParam({ name: 'symbol', example: 'TSLA', description: '주식 심볼' })
  @ApiResponse({ 
    status: 200, 
    description: '주식 상세 분석 정보', 
    type: StockAnalysisDto 
  })
  async getStockAnalysis(@Param('symbol') symbol: string) {
    const data = await this.stockService.getStockAnalysis(symbol.toUpperCase());
    return {
      success: true,
      data,
    };
  }

  @Get(':symbol/news-sentiment')
  @ApiOperation({ summary: '주식 뉴스 감성 분석 조회' })
  @ApiParam({ name: 'symbol', example: 'TSLA', description: '주식 심볼' })
  @ApiResponse({ 
    status: 200, 
    description: '뉴스 감성 분석 정보', 
    type: NewsSentimentDto 
  })
  async getNewsSentiment(@Param('symbol') symbol: string) {
    const data = await this.stockService.getNewsSentiment(symbol.toUpperCase());
    return {
      success: true,
      data,
    };
  }
}

