import { Module } from '@nestjs/common';
import { EtfModule } from '../etf/etf.module';
import { HiddenGemsController } from './hidden-gems.controller';
import { HiddenGemsService } from './hidden-gems.service';
import { DataCollectorService } from './services/data-collector.service';
import { InvestmentAnalyzerService } from './services/investment-analyzer.service';

@Module({
  imports: [EtfModule],
  controllers: [HiddenGemsController],
  providers: [HiddenGemsService, DataCollectorService, InvestmentAnalyzerService],
  exports: [HiddenGemsService],
})
export class HiddenGemsModule {}
