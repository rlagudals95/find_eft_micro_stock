
export interface InvestmentScore {
  totalScore: number;
  grade: string;
  rating: string;
  breakdown: {
    discoveryScore: number;
    financialScore: number;
    growthScore: number;
    valuationScore: number;
    momentumScore: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export interface GrowthPotential {
  oneMonthPrediction: number;
  threeMonthPrediction: number;
  confidence: number;
  targetPrice: number;
  upside: number;
  risks: string[];
  catalysts: string[];
}

export class InvestmentAnalyzer {
  
  // 종합 투자 점수 계산
  calculateInvestmentScore(data: any, etfWeight: number): InvestmentScore {
    const { financial, technical, news } = data;

    // 1. 발굴 점수 (25점) - ETF 소량 보유
    const discoveryScore = this.calculateDiscoveryScore(etfWeight);

    // 2. 재무 건전성 (25점)
    const financialScore = this.calculateFinancialScore(financial);

    // 3. 성장 잠재력 (25점)
    const growthScore = this.calculateGrowthScore(financial);

    // 4. 밸류에이션 (15점)
    const valuationScore = this.calculateValuationScore(financial);

    // 5. 시장 모멘텀 (10점)
    const momentumScore = this.calculateMomentumScore(technical, news);

    const totalScore = Math.round(
      discoveryScore + financialScore + growthScore + valuationScore + momentumScore
    );

    const { grade, rating } = this.getGradeAndRating(totalScore);
    const strengths = this.identifyStrengths(data, etfWeight);
    const weaknesses = this.identifyWeaknesses(data, etfWeight);
    const recommendation = this.getRecommendation(totalScore, strengths, weaknesses);

    return {
      totalScore,
      grade,
      rating,
      breakdown: {
        discoveryScore,
        financialScore,
        growthScore,
        valuationScore,
        momentumScore
      },
      strengths,
      weaknesses,
      recommendation
    };
  }

  // 1. 발굴 점수 계산
  private calculateDiscoveryScore(weight: number): number {
    if (weight < 0.5) return 25; // 극소량 - 최고 점수
    if (weight < 1.0) return 20; // 소량
    if (weight < 1.5) return 15; // 적정
    if (weight < 2.0) return 10; // 주목
    return 5; // 일반
  }

  // 2. 재무 건전성 점수
  private calculateFinancialScore(financial: any): number {
    if (!financial) return 0;

    let score = 0;

    // ROE (10점)
    if (financial.roe > 20) score += 10;
    else if (financial.roe > 15) score += 8;
    else if (financial.roe > 10) score += 5;
    else if (financial.roe > 0) score += 2;

    // 부채비율 (8점)
    if (financial.debtToEquity < 0.3) score += 8;
    else if (financial.debtToEquity < 0.5) score += 6;
    else if (financial.debtToEquity < 1.0) score += 4;
    else if (financial.debtToEquity < 2.0) score += 2;

    // 순이익률 (7점)
    if (financial.netMargin > 20) score += 7;
    else if (financial.netMargin > 15) score += 5;
    else if (financial.netMargin > 10) score += 3;
    else if (financial.netMargin > 0) score += 1;

    return Math.min(score, 25);
  }

  // 3. 성장 잠재력 점수
  private calculateGrowthScore(financial: any): number {
    if (!financial) return 0;

    let score = 0;

    // 매출 성장률 (12점)
    if (financial.revenueGrowth > 30) score += 12;
    else if (financial.revenueGrowth > 20) score += 10;
    else if (financial.revenueGrowth > 10) score += 7;
    else if (financial.revenueGrowth > 0) score += 4;

    // 순이익 성장률 (10점)
    if (financial.earningsGrowth > 30) score += 10;
    else if (financial.earningsGrowth > 20) score += 8;
    else if (financial.earningsGrowth > 10) score += 5;
    else if (financial.earningsGrowth > 0) score += 3;

    // EPS 성장률 (3점)
    if (financial.epsGrowth > 20) score += 3;
    else if (financial.epsGrowth > 10) score += 2;
    else if (financial.epsGrowth > 0) score += 1;

    return Math.min(score, 25);
  }

  // 4. 밸류에이션 점수
  private calculateValuationScore(financial: any): number {
    if (!financial) return 0;

    let score = 0;

    // P/E 비율 (8점)
    if (financial.pe > 0 && financial.pe < 15) score += 8;
    else if (financial.pe < 25) score += 6;
    else if (financial.pe < 35) score += 4;
    else if (financial.pe < 50) score += 2;

    // P/B 비율 (4점)
    if (financial.pb > 0 && financial.pb < 2) score += 4;
    else if (financial.pb < 3) score += 3;
    else if (financial.pb < 5) score += 2;
    else if (financial.pb < 10) score += 1;

    // P/S 비율 (3점)
    if (financial.ps > 0 && financial.ps < 3) score += 3;
    else if (financial.ps < 5) score += 2;
    else if (financial.ps < 10) score += 1;

    return Math.min(score, 15);
  }

  // 5. 시장 모멘텀 점수
  private calculateMomentumScore(technical: any, news: any): number {
    if (!technical) return 0;

    let score = 0;

    // RSI (5점)
    if (technical.rsi >= 40 && technical.rsi <= 60) score += 5; // 중립 구간
    else if (technical.rsi >= 30 && technical.rsi <= 70) score += 3;
    else score += 1;

    // 추세 (3점)
    if (technical.trend === 'bullish') score += 3;
    else if (technical.trend === 'neutral') score += 2;
    else score += 1;

    // 뉴스 센티먼트 (2점)
    if (news && news.sentimentScore > 60) score += 2;
    else if (news && news.sentimentScore > 50) score += 1;

    return Math.min(score, 10);
  }

  // 등급 및 평가
  private getGradeAndRating(score: number): { grade: string; rating: string } {
    if (score >= 90) return { grade: '🌟🌟🌟', rating: 'Strong Buy' };
    if (score >= 80) return { grade: '🌟🌟', rating: 'Buy' };
    if (score >= 70) return { grade: '🌟', rating: 'Moderate Buy' };
    if (score >= 60) return { grade: '⭐', rating: 'Hold' };
    return { grade: '⚠️', rating: 'Caution' };
  }

  // 강점 식별
  private identifyStrengths(data: any, etfWeight: number): string[] {
    const strengths: string[] = [];
    const { financial, technical, news } = data;

    if (etfWeight < 0.5) {
      strengths.push('전문가가 주목하기 시작한 극소량 보유 종목');
    }

    if (financial) {
      if (financial.roe > 20) strengths.push(`높은 자기자본이익률 (ROE ${financial.roe.toFixed(1)}%)`);
      if (financial.revenueGrowth > 20) strengths.push(`강력한 매출 성장 (${financial.revenueGrowth.toFixed(1)}% YoY)`);
      if (financial.debtToEquity < 0.5) strengths.push('건전한 재무 구조 (낮은 부채비율)');
      if (financial.netMargin > 15) strengths.push(`우수한 수익성 (순이익률 ${financial.netMargin.toFixed(1)}%)`);
    }

    if (technical) {
      if (technical.trend === 'bullish') strengths.push('상승 추세 유지 중');
      if (technical.rsi >= 40 && technical.rsi <= 60) strengths.push('적정 RSI 수준 (과매수/과매도 아님)');
    }

    if (news && news.sentimentScore > 60) {
      strengths.push('긍정적인 뉴스 센티먼트');
    }

    return strengths.slice(0, 5); // 최대 5개
  }

  // 약점 식별
  private identifyWeaknesses(data: any, etfWeight: number): string[] {
    const weaknesses: string[] = [];
    const { financial, technical, news } = data;

    if (etfWeight > 1.5) {
      weaknesses.push('이미 상당한 비중으로 보유 중 (발굴 효과 제한적)');
    }

    if (financial) {
      if (financial.roe < 5) weaknesses.push('낮은 자기자본이익률');
      if (financial.debtToEquity > 1.5) weaknesses.push('높은 부채비율');
      if (financial.revenueGrowth < 0) weaknesses.push('매출 감소 추세');
      if (financial.pe > 50) weaknesses.push('높은 밸류에이션 (P/E 비율)');
    }

    if (technical) {
      if (technical.trend === 'bearish') weaknesses.push('하락 추세');
      if (technical.rsi < 30) weaknesses.push('과매도 상태 (추가 하락 가능)');
      if (technical.rsi > 70) weaknesses.push('과매수 상태 (조정 가능)');
    }

    if (news && news.sentimentScore < 40) {
      weaknesses.push('부정적인 뉴스 센티먼트');
    }

    return weaknesses.slice(0, 5); // 최대 5개
  }

  // 투자 추천
  private getRecommendation(score: number, strengths: string[], weaknesses: string[]): string {
    if (score >= 90) {
      return '매우 우수한 투자 기회입니다. 전문가들이 주목하는 강력한 성장 잠재력을 보유하고 있습니다.';
    } else if (score >= 80) {
      return '우수한 투자 후보입니다. 재무 건전성과 성장성이 양호하며, 적극적인 투자를 고려할 만합니다.';
    } else if (score >= 70) {
      return '양호한 투자 기회입니다. 일부 리스크가 있지만 장기적 관점에서 긍정적입니다.';
    } else if (score >= 60) {
      return '관망이 필요합니다. 추가적인 모니터링과 분석이 필요한 종목입니다.';
    } else {
      return '주의가 필요합니다. 현재로서는 투자를 권장하지 않습니다.';
    }
  }

  // 상승 가능성 분석
  calculateGrowthPotential(data: any, investmentScore: InvestmentScore): GrowthPotential {
    const { quote, financial, technical, news } = data;

    // 간단한 예측 모델 (실제로는 ML 모델 사용)
    const baseReturn = (investmentScore.totalScore - 50) * 0.5; // 점수 기반 기본 수익률
    
    // 1개월 예측
    const oneMonthPrediction = this.calculatePrediction(baseReturn, 1, technical, news);
    
    // 3개월 예측
    const threeMonthPrediction = this.calculatePrediction(baseReturn, 3, technical, news);

    // 신뢰도 계산
    const confidence = this.calculateConfidence(data, investmentScore);

    // 목표 주가 계산
    const currentPrice = quote?.price || 0;
    const targetPrice = currentPrice * (1 + threeMonthPrediction / 100);
    const upside = threeMonthPrediction;

    // 리스크 식별
    const risks = this.identifyRisks(data, financial);

    // 촉매제 식별
    const catalysts = this.identifyCatalysts(data, financial, news);

    return {
      oneMonthPrediction,
      threeMonthPrediction,
      confidence,
      targetPrice,
      upside,
      risks,
      catalysts
    };
  }

  private calculatePrediction(baseReturn: number, months: number, technical: any, news: any): number {
    let prediction = baseReturn * months;

    // 기술적 지표 반영
    if (technical) {
      if (technical.trend === 'bullish') prediction += 5 * months;
      else if (technical.trend === 'bearish') prediction -= 5 * months;

      if (technical.rsi < 30) prediction += 3 * months; // 과매도 반등 기대
      else if (technical.rsi > 70) prediction -= 3 * months; // 과매수 조정 예상
    }

    // 뉴스 센티먼트 반영
    if (news) {
      const sentimentImpact = (news.sentimentScore - 50) * 0.2 * months;
      prediction += sentimentImpact;
    }

    return Math.round(prediction * 10) / 10; // 소수점 1자리
  }

  private calculateConfidence(data: any, score: InvestmentScore): number {
    let confidence = 50; // 기본 50%

    // 데이터 완전성
    if (data.financial) confidence += 15;
    if (data.technical) confidence += 15;
    if (data.news && data.news.newsCount > 5) confidence += 10;

    // 투자 점수 반영
    if (score.totalScore >= 80) confidence += 10;
    else if (score.totalScore < 60) confidence -= 10;

    return Math.min(95, Math.max(30, confidence));
  }

  private identifyRisks(data: any, financial: any): string[] {
    const risks: string[] = [];

    if (financial) {
      if (financial.debtToEquity > 1.5) risks.push('높은 부채 수준');
      if (financial.currentRatio < 1.0) risks.push('유동성 부족');
      if (financial.revenueGrowth < 0) risks.push('매출 감소');
    }

    if (data.quote) {
      const volatility = Math.abs(data.quote.changePercent);
      if (volatility > 5) risks.push('높은 가격 변동성');
    }

    if (data.technical && data.technical.trend === 'bearish') {
      risks.push('하락 추세');
    }

    return risks.slice(0, 5);
  }

  private identifyCatalysts(data: any, financial: any, news: any): string[] {
    const catalysts: string[] = [];

    if (financial) {
      if (financial.revenueGrowth > 20) catalysts.push('강력한 매출 성장');
      if (financial.roe > 20) catalysts.push('높은 수익성');
    }

    if (news && news.sentimentScore > 60) {
      catalysts.push('긍정적인 시장 센티먼트');
    }

    if (data.technical && data.technical.trend === 'bullish') {
      catalysts.push('상승 모멘텀');
    }

    if (data.quote && data.quote.volume > data.quote.avgVolume * 1.5) {
      catalysts.push('거래량 급증');
    }

    return catalysts.slice(0, 5);
  }
}
