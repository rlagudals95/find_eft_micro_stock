import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalysisModule } from './analysis/analysis.module';
import { EtfModule } from './etf/etf.module';
import { HealthController } from './health/health.controller';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    EtfModule,
    StockModule,
    AnalysisModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
