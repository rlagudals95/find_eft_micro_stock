import { ArrowUpRight, BarChart3, Search, Star, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatCard } from '../components/StatCard';
import { StockCard } from '../components/StockCard';
import { analysisApi, ETF, etfApi, GrowthStock, MarketInsight } from '../services/api';

export const Dashboard: React.FC = () => {
  const [etfs, setEtfs] = useState<ETF[]>([]);
  const [growthStocks, setGrowthStocks] = useState<GrowthStock[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 병렬로 데이터 수집
        const [etfsResponse, growthStocksResponse, insightsResponse] = await Promise.all([
          etfApi.getAllETFs(),
          analysisApi.getGrowthStocks(10, 75),
          analysisApi.getMarketInsights()
        ]);

        setEtfs(etfsResponse.data);
        setGrowthStocks(growthStocksResponse.data);
        setMarketInsights(insightsResponse.data);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="데이터를 불러오는 중..." />
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
          ETF Stars 대시보드
        </h1>
        <p className="text-xl text-gray-600">
          월가 전문가들이 주목하는 성장주를 발견하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="분석된 ETF"
          value={etfs.length}
          icon={TrendingUp}
          color="primary"
          description="현재 분석 중인 ETF 수"
        />
        
        <StatCard
          title="발굴된 성장주"
          value={growthStocks.length}
          icon={Star}
          color="success"
          description="전문가가 주목하는 종목"
        />
        
        <StatCard
          title="평균 점수"
          value={growthStocks.length > 0 
            ? Math.round(growthStocks.reduce((sum, stock) => sum + stock.score, 0) / growthStocks.length)
            : 0
          }
          icon={Search}
          color="warning"
          description="성장주 평균 점수"
        />
        
        <StatCard
          title="시장 인사이트"
          value={marketInsights.length}
          icon={BarChart3}
          color="danger"
          description="분석된 시장 동향"
        />
      </div>

      {/* 상위 성장주 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">상위 성장주</h2>
            <a href="/growth-stocks" className="text-primary-600 hover:text-primary-700 flex items-center">
              전체 보기 <ArrowUpRight className="w-4 h-4 ml-1" />
            </a>
          </div>
          
          <div className="space-y-4">
            {growthStocks.slice(0, 5).map((stock, index) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                rank={index + 1}
                showDetails={false}
              />
            ))}
          </div>
        </div>

        {/* 시장 인사이트 */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">시장 인사이트</h2>
          
          <div className="space-y-4">
            {marketInsights.map((insight, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{insight.sector}</span>
                  <div className="flex items-center space-x-2">
                    {insight.trend === 'up' && <TrendingUp className="w-4 h-4 text-success-600" />}
                    {insight.trend === 'down' && <TrendingDown className="w-4 h-4 text-danger-600" />}
                    <span className="text-sm text-gray-500">{insight.confidence}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ETF 요약 */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">분석 중인 ETF</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {etfs.map((etf) => (
            <div key={etf.symbol} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{etf.symbol}</span>
                <span className="text-sm text-gray-500">{etf.expenseRatio}%</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{etf.name}</p>
              <div className="text-xs text-gray-500">
                자산: ${(etf.totalAssets / 1_000_000_000).toFixed(1)}B
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
