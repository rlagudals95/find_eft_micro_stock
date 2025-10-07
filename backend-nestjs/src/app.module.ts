import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalysisModule } from './analysis/analysis.module';
import { EtfModule } from './etf/etf.module';
import { HealthController } from './health/health.controller';
import { HiddenGemsModule } from './hidden-gems/hidden-gems.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    EtfModule,
    HiddenGemsModule,
    AnalysisModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
