import { Activity, ArrowLeft, BarChart3, DollarSign, PieChart, TrendingUp } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { STOCK_TERMS, Tooltip } from '../components/Tooltip';
import { useStockAnalysis } from '../hooks/useStockAnalysis';
import { InvestmentRecommendation } from '../services/api';

export const StockDetail: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  
  // React Query로 데이터 가져오기 (자동 캐싱)
  const { data: analysis, isLoading, isError, error, refetch } = useStockAnalysis(symbol || '');

  const getRecommendationColor = (recommendation: InvestmentRecommendation) => {
    switch (recommendation) {
      case InvestmentRecommendation.STRONG_BUY:
        return 'bg-green-600 text-white';
      case InvestmentRecommendation.BUY:
        return 'bg-green-500 text-white';
      case InvestmentRecommendation.HOLD:
        return 'bg-yellow-500 text-white';
      case InvestmentRecommendation.SELL:
        return 'bg-red-500 text-white';
      case InvestmentRecommendation.STRONG_SELL:
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRecommendationText = (recommendation: InvestmentRecommendation) => {
    switch (recommendation) {
      case InvestmentRecommendation.STRONG_BUY:
        return '적극 매수';
      case InvestmentRecommendation.BUY:
        return '매수';
      case InvestmentRecommendation.HOLD:
        return '보유';
      case InvestmentRecommendation.SELL:
        return '매도';
      case InvestmentRecommendation.STRONG_SELL:
        return '적극 매도';
      default:
        return '분석 중';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000_000) {
      return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
    } else if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    }
    return `$${num.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" text="분석 중..." />
      </div>
    );
  }

  if (isError || !analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          돌아가기
        </button>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : '주식 정보를 불러오는데 실패했습니다.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          돌아가기
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{symbol}</h1>
            <p className="text-xl text-gray-600">{analysis.basic.name}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-gray-600">섹터: {analysis.basic.sector}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-600">{analysis.basic.industry}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-gray-900">${analysis.basic.price.toFixed(2)}</div>
            <div className="text-sm text-gray-600">현재 주가</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 투자 추천 & 종합 점수 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-gradient-to-br from-blue-50 to-purple-50">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              투자 추천
            </h3>
            <div className="text-center py-6">
              <div className={`inline-block px-8 py-4 rounded-xl text-2xl font-bold mb-4 ${getRecommendationColor(analysis.recommendation)}`}>
                {getRecommendationText(analysis.recommendation)}
              </div>
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {analysis.investmentScore.total}점
              </div>
              <p className="text-gray-600">종합 투자 점수</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              기본 정보
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  시가총액
                  <Tooltip term={STOCK_TERMS.MARKET_CAP.term} description={STOCK_TERMS.MARKET_CAP.description} />
                </span>
                <span className="text-xl font-semibold">{formatNumber(analysis.basic.marketCap)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  적정 주가
                  <Tooltip term={STOCK_TERMS.FAIR_VALUE.term} description={STOCK_TERMS.FAIR_VALUE.description} />
                </span>
                <span className="text-xl font-semibold">${analysis.valuation.fairValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center">
                  상승 여력
                  <Tooltip term={STOCK_TERMS.UPSIDE.term} description={STOCK_TERMS.UPSIDE.description} />
                </span>
                <span className={`text-xl font-semibold ${analysis.valuation.upside >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.valuation.upside >= 0 ? '+' : ''}{analysis.valuation.upside.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">평가</span>
                <span className={`text-xl font-semibold ${analysis.valuation.isUndervalued ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.valuation.isUndervalued ? '저평가 📉' : '고평가 📈'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 투자 점수 세부 분석 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            세부 점수 분석
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(analysis.investmentScore.breakdown).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="mb-3">
                  <span className="text-sm font-semibold text-gray-700 block mb-2">
                    {key === 'financial' && '재무건전성'}
                    {key === 'growth' && '성장성'}
                    {key === 'valuation' && '밸류에이션'}
                    {key === 'profitability' && '수익성'}
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-3 mb-3 text-xs flex rounded-full bg-gray-200">
                    <div
                      style={{ width: `${value}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                        value >= 80 ? 'bg-green-500' :
                        value >= 60 ? 'bg-blue-500' :
                        value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    ></div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 재무 지표 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            재무 지표
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-2 flex items-center justify-center">
                PER
                <Tooltip term={STOCK_TERMS.PER.term} description={STOCK_TERMS.PER.description} />
              </p>
              <p className="text-2xl font-bold text-gray-900">{analysis.financials.per.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-2 flex items-center justify-center">
                PBR
                <Tooltip term={STOCK_TERMS.PBR.term} description={STOCK_TERMS.PBR.description} />
              </p>
              <p className="text-2xl font-bold text-gray-900">{analysis.financials.pbr.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-2 flex items-center justify-center">
                EPS
                <Tooltip term={STOCK_TERMS.EPS.term} description={STOCK_TERMS.EPS.description} />
              </p>
              <p className="text-2xl font-bold text-gray-900">${analysis.financials.eps.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-2 flex items-center justify-center">
                부채비율
                <Tooltip term={STOCK_TERMS.DEBT_TO_EQUITY.term} description={STOCK_TERMS.DEBT_TO_EQUITY.description} />
              </p>
              <p className="text-2xl font-bold text-gray-900">{(analysis.financials.debtToEquity * 100).toFixed(1)}%</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-2 flex items-center justify-center">
                유동비율
                <Tooltip term={STOCK_TERMS.CURRENT_RATIO.term} description={STOCK_TERMS.CURRENT_RATIO.description} />
              </p>
              <p className="text-2xl font-bold text-gray-900">{analysis.financials.currentRatio.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* 수익성 지표 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">수익성 지표</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-2 flex items-center justify-center">
                ROE
                <Tooltip term={STOCK_TERMS.ROE.term} description={STOCK_TERMS.ROE.description} />
              </p>
              <p className="text-2xl font-bold text-green-600">{analysis.profitability.roe.toFixed(2)}%</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-2 flex items-center justify-center">
                ROA
                <Tooltip term={STOCK_TERMS.ROA.term} description={STOCK_TERMS.ROA.description} />
              </p>
              <p className="text-2xl font-bold text-green-600">{analysis.profitability.roa.toFixed(2)}%</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-2 flex items-center justify-center">
                순이익률
                <Tooltip term={STOCK_TERMS.PROFIT_MARGIN.term} description={STOCK_TERMS.PROFIT_MARGIN.description} />
              </p>
              <p className="text-2xl font-bold text-green-600">{analysis.profitability.profitMargin.toFixed(2)}%</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-2 flex items-center justify-center">
                영업이익률
                <Tooltip term={STOCK_TERMS.OPERATING_MARGIN.term} description={STOCK_TERMS.OPERATING_MARGIN.description} />
              </p>
              <p className="text-2xl font-bold text-green-600">{analysis.profitability.operatingMargin.toFixed(2)}%</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-gray-600 text-sm mb-2 flex items-center justify-center">
                EBITDA 마진
                <Tooltip term={STOCK_TERMS.EBITDA_MARGIN.term} description={STOCK_TERMS.EBITDA_MARGIN.description} />
              </p>
              <p className="text-2xl font-bold text-green-600">{analysis.profitability.ebitdaMargin.toFixed(2)}%</p>
            </div>
          </div>
        </div>

        {/* 성장성 지표 */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            성장성 지표
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <p className="text-gray-700 text-sm mb-2 flex items-center justify-center">
                매출 성장률
                <Tooltip term={STOCK_TERMS.REVENUE_GROWTH.term} description={STOCK_TERMS.REVENUE_GROWTH.description} />
              </p>
              <p className={`text-3xl font-bold ${analysis.growth.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analysis.growth.revenueGrowth >= 0 ? '+' : ''}{analysis.growth.revenueGrowth.toFixed(2)}%
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <p className="text-gray-700 text-sm mb-2 flex items-center justify-center">
                이익 성장률
                <Tooltip term={STOCK_TERMS.EARNINGS_GROWTH.term} description={STOCK_TERMS.EARNINGS_GROWTH.description} />
              </p>
              <p className={`text-3xl font-bold ${analysis.growth.earningsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analysis.growth.earningsGrowth >= 0 ? '+' : ''}{analysis.growth.earningsGrowth.toFixed(2)}%
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
              <p className="text-gray-700 text-sm mb-2 flex items-center justify-center">
                EPS 성장률
                <Tooltip term={STOCK_TERMS.EPS_GROWTH.term} description={STOCK_TERMS.EPS_GROWTH.description} />
              </p>
              <p className={`text-3xl font-bold ${analysis.growth.epsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analysis.growth.epsGrowth >= 0 ? '+' : ''}{analysis.growth.epsGrowth.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* 투자 인사이트 */}
        <div className="card bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
          <h3 className="text-xl font-bold mb-6">💡 투자 인사이트</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.reasons.map((reason, index) => (
              <div key={index} className="flex items-start bg-white p-4 rounded-lg shadow-sm">
                <span className="flex items-center justify-center w-6 h-6 bg-primary-600 text-white rounded-full text-sm font-bold mr-3 flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-800">{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 면책 조항 */}
        <div className="card bg-yellow-50 border-l-4 border-yellow-400">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ 투자 유의사항:</strong> 본 정보는 투자 참고용이며, 투자 결정에 대한 책임은 투자자 본인에게 있습니다. 
            과거의 성과가 미래의 수익을 보장하지 않습니다.
          </p>
        </div>

        {/* 마지막 업데이트 */}
        <div className="text-center text-sm text-gray-500">
          마지막 업데이트: {new Date(analysis.lastUpdated).toLocaleString('ko-KR')}
        </div>
      </div>
    </div>
  );
};

