import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalysisService {
  getMarketInsights() {
    return [
      {
        sector: 'Technology',
        trend: 'up' as const,
        confidence: 85,
        description: 'AI 및 반도체 관련 종목들이 강세를 보이고 있습니다.',
      },
      {
        sector: 'Healthcare',
        trend: 'stable' as const,
        confidence: 70,
        description:
          '바이오테크 및 디지털 헬스케어 분야가 안정적인 성장을 보입니다.',
      },
      {
        sector: 'Financial',
        trend: 'down' as const,
        confidence: 60,
        description: '금리 상승 우려로 금융주들이 부진한 모습을 보입니다.',
      },
      {
        sector: 'Consumer',
        trend: 'stable' as const,
        confidence: 65,
        description: '소비재 섹터는 안정적이나 성장 모멘텀은 제한적입니다.',
      },
    ];
  }
}
