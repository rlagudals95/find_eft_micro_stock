import { AlertCircle, Eye, Filter, Search, Star, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { etfApi, Holding } from '../services/api';

interface HiddenGem extends Holding {
  etfSymbol: string;
  etfName: string;
  reason: string;
  potentialScore: number;
}

export const HiddenGems: React.FC = () => {
  const [hiddenGems, setHiddenGems] = useState<HiddenGem[]>([]);
  const [allEtfData, setAllEtfData] = useState<Array<{symbol: string; name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedETF, setSelectedETF] = useState<string>('all');
  const [minWeight, setMinWeight] = useState(0.1);
  const [maxWeight, setMaxWeight] = useState(2.0);

  useEffect(() => {
    fetchHiddenGems();
  }, [selectedETF, minWeight, maxWeight]);

  const fetchHiddenGems = async () => {
    try {
      setLoading(true);
      
      // 모든 ETF 데이터를 한 번에 가져오기
      const response = await etfApi.getAllETFsWithHoldings();
      const allEtfsData = response.data;

      // ETF 목록 저장 (select 옵션용)
      setAllEtfData(allEtfsData.map(etf => ({ symbol: etf.symbol, name: etf.name })));

      // 선택된 ETF에 따라 필터링
      const filteredEtfs = selectedETF === 'all' 
        ? allEtfsData 
        : allEtfsData.filter(etf => etf.symbol === selectedETF);

      // 모든 ETF의 숨은 보석 추출
      const gems: HiddenGem[] = [];
      
      filteredEtfs.forEach(etf => {
        // 소량 보유 종목 필터링 (하위 종목)
        const smallHoldings = etf.holdings
          .filter(h => h.weight >= minWeight && h.weight <= maxWeight)
          .sort((a, b) => a.weight - b.weight) // 작은 비중부터
          .slice(0, 20); // 상위 20개

        smallHoldings.forEach(holding => {
          const potentialScore = calculatePotentialScore(holding);
          const reason = getInvestmentReason(holding);

          gems.push({
            ...holding,
            etfSymbol: etf.symbol,
            etfName: etf.name,
            reason,
            potentialScore
          });
        });
      });

      // 잠재력 점수순으로 정렬
      gems.sort((a, b) => b.potentialScore - a.potentialScore);
      setHiddenGems(gems);
    } catch (error) {
      console.error('Error fetching hidden gems:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePotentialScore = (holding: Holding): number => {
    let score = 0;
    
    // 소량 보유일수록 높은 점수 (정찰병 전략)
    if (holding.weight < 0.5) score += 50;
    else if (holding.weight < 1.0) score += 40;
    else if (holding.weight < 1.5) score += 30;
    else score += 20;

    // 보유 주식 수 고려
    if (holding.shares > 100000) score += 30;
    else if (holding.shares > 50000) score += 20;
    else score += 10;

    return Math.min(score, 100);
  };

  const getInvestmentReason = (holding: Holding): string => {
    if (holding.weight < 0.5) {
      return '극소량 보유 - 전문가가 주목하기 시작한 초기 단계';
    } else if (holding.weight < 1.0) {
      return '소량 보유 - 잠재력 확인 중인 정찰병 종목';
    } else if (holding.weight < 1.5) {
      return '적정 보유 - 성장 가능성을 인정받기 시작';
    } else {
      return '주목 종목 - 포지션을 늘려가는 중';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="숨은 보석을 찾는 중..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Star className="w-10 h-10 text-yellow-500" />
          <h1 className="text-4xl font-bold text-gray-900">
            숨은 보석 찾기
          </h1>
          <Star className="w-10 h-10 text-yellow-500" />
        </div>
        <p className="text-xl text-gray-600 mb-2">
          전문가들이 소량으로 담은 미래 성장주를 발견하세요
        </p>
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">ETF 하위 보유 종목에서 잠재력 있는 기업을 찾습니다</span>
        </div>
      </div>

      {/* 필터 */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              ETF 선택
            </label>
            <select
              value={selectedETF}
              onChange={(e) => setSelectedETF(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">전체 ETF</option>
              {allEtfData.map(etf => (
                <option key={etf.symbol} value={etf.symbol}>
                  {etf.symbol} - {etf.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최소 보유 비중 (%)
            </label>
            <input
              type="number"
              value={minWeight}
              onChange={(e) => setMinWeight(Number(e.target.value))}
              step="0.1"
              min="0"
              max="5"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최대 보유 비중 (%)
            </label>
            <input
              type="number"
              value={maxWeight}
              onChange={(e) => setMaxWeight(Number(e.target.value))}
              step="0.1"
              min="0"
              max="5"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <strong>💡 팁:</strong> 0.1% ~ 2% 사이의 종목이 가장 주목할 만한 '정찰병' 종목입니다.
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {hiddenGems.length}
          </div>
          <div className="text-sm text-gray-600">발견된 숨은 보석</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-success-600 mb-2">
            {hiddenGems.filter(g => g.potentialScore >= 70).length}
          </div>
          <div className="text-sm text-gray-600">고잠재력 종목</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-warning-600 mb-2">
            {new Set(hiddenGems.map(g => g.etfSymbol)).size}
          </div>
          <div className="text-sm text-gray-600">분석된 ETF</div>
        </div>
      </div>

      {/* 숨은 보석 목록 */}
      <div className="space-y-4">
        {hiddenGems.map((gem, index) => (
          <div key={`${gem.etfSymbol}-${gem.symbol}`} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                    #{index + 1}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{gem.symbol}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {gem.etfSymbol}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      gem.potentialScore >= 70 ? 'bg-success-100 text-success-700' :
                      gem.potentialScore >= 50 ? 'bg-warning-100 text-warning-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      잠재력 {gem.potentialScore}점
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3">{gem.name}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-primary-600" />
                      <span className="text-sm text-gray-600">
                        보유 비중: <strong className="text-gray-900">{gem.weight.toFixed(2)}%</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-primary-600" />
                      <span className="text-sm text-gray-600">
                        보유 주식: <strong className="text-gray-900">{gem.shares.toLocaleString()}주</strong>
                      </span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                    <div className="flex items-start space-x-2">
                      <Star className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900 mb-1">투자 인사이트</p>
                        <p className="text-sm text-yellow-800">{gem.reason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hiddenGems.length === 0 && (
        <div className="text-center py-12 card">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            조건에 맞는 숨은 보석을 찾지 못했습니다
          </h3>
          <p className="text-gray-600">
            필터 조건을 조정해보세요. 보통 0.1% ~ 2% 사이에서 좋은 종목을 발견할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
};
