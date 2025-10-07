import { BarChart3, Eye } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ETFCard } from '../components/ETFCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ETF, etfApi, Holding } from '../services/api';

export const ETFList: React.FC = () => {
  const [etfs, setEtfs] = useState<ETF[]>([]);
  const [selectedETF, setSelectedETF] = useState<ETF | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchETFs = async () => {
      try {
        setLoading(true);
        const response = await etfApi.getAllETFs();
        setEtfs(response.data);
      } catch (err) {
        setError('ETF 데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('ETF fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchETFs();
  }, []);

  const handleETFSelect = async (etf: ETF) => {
    try {
      setHoldingsLoading(true);
      setSelectedETF(etf);
      const response = await etfApi.getETFHoldings(etf.symbol);
      setHoldings(response.data);
    } catch (err) {
      console.error('Holdings fetch error:', err);
    } finally {
      setHoldingsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="ETF 데이터를 불러오는 중..." />
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
          ETF 목록
        </h1>
        <p className="text-xl text-gray-600">
          분석 중인 ETF들의 상세 정보를 확인하세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ETF 목록 */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">ETF 목록</h2>
            
            <div className="space-y-3">
              {etfs.map((etf) => (
                <ETFCard
                  key={etf.symbol}
                  etf={etf}
                  isSelected={selectedETF?.symbol === etf.symbol}
                  onSelect={handleETFSelect}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 선택된 ETF 상세 정보 */}
        <div className="lg:col-span-2">
          {selectedETF ? (
            <div className="space-y-6">
              {/* ETF 기본 정보 */}
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedETF.symbol}</h2>
                    <p className="text-lg text-gray-600">{selectedETF.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">수수료</div>
                    <div className="text-xl font-bold text-primary-600">{selectedETF.expenseRatio}%</div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{selectedETF.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">총 자산</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(selectedETF.totalAssets)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">설립일</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Date(selectedETF.inceptionDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">마지막 업데이트</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Date(selectedETF.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">보유 종목</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {holdings.length}개
                    </div>
                  </div>
                </div>
              </div>

              {/* 보유 종목 목록 */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">보유 종목</h3>
                  {holdingsLoading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                  )}
                </div>

                {holdings.length > 0 ? (
                  <div className="space-y-3">
                    {holdings.map((holding, index) => (
                      <div key={holding.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-700">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{holding.symbol}</h4>
                            <p className="text-sm text-gray-600">{holding.name}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {holding.weight.toFixed(2)}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {holding.shares.toLocaleString()}주
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">보유 종목 정보를 불러오는 중...</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ETF를 선택하세요</h3>
              <p className="text-gray-500">왼쪽 목록에서 ETF를 선택하면 상세 정보를 확인할 수 있습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
