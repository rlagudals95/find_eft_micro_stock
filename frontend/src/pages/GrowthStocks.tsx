import { BarChart3, Filter } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StockCard } from '../components/StockCard';
import { analysisApi, GrowthStock } from '../services/api';

export const GrowthStocks: React.FC = () => {
  const [growthStocks, setGrowthStocks] = useState<GrowthStock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<GrowthStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(70);
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'marketCap'>('score');

  useEffect(() => {
    const fetchGrowthStocks = async () => {
      try {
        setLoading(true);
        const response = await analysisApi.getGrowthStocks(50, minScore);
        setGrowthStocks(response.data);
        setFilteredStocks(response.data);
      } catch (err) {
        setError('성장주 데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('Growth stocks fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthStocks();
  }, [minScore]);

  useEffect(() => {
    let sorted = [...growthStocks];
    
    switch (sortBy) {
      case 'score':
        sorted.sort((a, b) => b.score - a.score);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'marketCap':
        sorted.sort((a, b) => b.metrics.marketCap - a.metrics.marketCap);
        break;
    }
    
    setFilteredStocks(sorted);
  }, [growthStocks, sortBy]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="성장주 데이터를 불러오는 중..." />
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
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          성장주 분석
        </h1>
        <p className="text-xl text-gray-600">
          전문가들이 주목하는 잠재 성장주를 발견하세요
        </p>
      </div>

      {/* 필터 및 정렬 */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">최소 점수:</label>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value={60}>60점 이상</option>
                <option value={70}>70점 이상</option>
                <option value={80}>80점 이상</option>
                <option value={90}>90점 이상</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">정렬:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
            >
              <option value="score">점수순</option>
              <option value="name">이름순</option>
              <option value="marketCap">시가총액순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 성장주 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStocks.map((stock, index) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            rank={index + 1}
            showDetails={true}
          />
        ))}
      </div>

      {filteredStocks.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">조건에 맞는 성장주가 없습니다.</p>
          <p className="text-sm text-gray-400">필터 조건을 조정해보세요.</p>
        </div>
      )}
    </div>
  );
};
