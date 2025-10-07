import { BarChart3, Filter, Star, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { analysisApi, ETF, etfApi, GrowthStock, MarketInsight } from '../services/api';

export const Analysis: React.FC = () => {
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [growthStocks, setGrowthStocks] = useState<GrowthStock[]>([]);
  const [etfs, setEtfs] = useState<ETF[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string>('all');

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        
        const [insightsResponse, stocksResponse, etfsResponse] = await Promise.all([
          analysisApi.getMarketInsights(),
          analysisApi.getGrowthStocks(20, 75),
          etfApi.getAllETFs()
        ]);

        setMarketInsights(insightsResponse.data);
        setGrowthStocks(stocksResponse.data);
        setEtfs(etfsResponse.data);
      } catch (err) {
        setError('분석 데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('Analysis data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-danger-600" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-success-600 bg-success-100';
      case 'down':
        return 'text-danger-600 bg-danger-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'up':
        return '상승';
      case 'down':
        return '하락';
      default:
        return '안정';
    }
  };

  const filteredInsights = selectedSector === 'all' 
    ? marketInsights 
    : marketInsights.filter(insight => insight.sector === selectedSector);

  const sectors = ['all', ...Array.from(new Set(marketInsights.map(insight => insight.sector)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          시장 분석
        </h1>
        <p className="text-xl text-gray-600">
          전문가 관점에서 본 시장 동향과 투자 인사이트
        </p>
      </div>

      {/* 섹터 필터 */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">섹터 필터:</span>
          <div className="flex space-x-2">
            {sectors.map((sector) => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedSector === sector
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sector === 'all' ? '전체' : sector}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 시장 인사이트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredInsights.map((insight, index) => (
          <div key={index} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{insight.sector}</h3>
                <p className="text-gray-600 mt-1">{insight.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(insight.trend)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(insight.trend)}`}>
                  {getTrendLabel(insight.trend)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500">신뢰도</span>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${insight.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{insight.confidence}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 성장주 분석 요약 */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">성장주 분석 요약</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">{growthStocks.length}</div>
            <div className="text-sm text-gray-600">발굴된 성장주</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600 mb-2">
              {growthStocks.length > 0 
                ? Math.round(growthStocks.reduce((sum, stock) => sum + stock.score, 0) / growthStocks.length)
                : 0
              }
            </div>
            <div className="text-sm text-gray-600">평균 점수</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600 mb-2">
              {growthStocks.filter(stock => stock.score >= 90).length}
            </div>
            <div className="text-sm text-gray-600">고득점 종목</div>
          </div>
        </div>

        {/* 상위 성장주 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">상위 성장주</h3>
          <div className="space-y-3">
            {growthStocks.slice(0, 5).map((stock, index) => (
              <div key={stock.symbol} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{stock.symbol}</h4>
                    <p className="text-sm text-gray-600">{stock.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{stock.score}점</div>
                    <div className="text-sm text-gray-500">
                      {stock.etfExposure.length}개 ETF 노출
                    </div>
                  </div>
                  <Star className="w-5 h-5 text-warning-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ETF 분석 요약 */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">ETF 분석 요약</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {etfs.map((etf) => (
            <div key={etf.symbol} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{etf.symbol}</h3>
                <span className="text-sm text-gray-500">{etf.expenseRatio}%</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{etf.name}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">총 자산</span>
                  <span className="font-medium">
                    ${(etf.totalAssets / 1_000_000_000).toFixed(1)}B
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">설립일</span>
                  <span className="font-medium">
                    {new Date(etf.inceptionDate).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
