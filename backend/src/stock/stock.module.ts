import { Module } from '@nestjs/common';
import { FinnhubNewsService } from './services/finnhub-news.service';
import { NewsSentimentService } from './services/news-sentiment.service';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  controllers: [StockController],
  providers: [StockService, NewsSentimentService, FinnhubNewsService],
  exports: [StockService],
})
export class StockModule {}

