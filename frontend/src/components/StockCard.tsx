import { Eye, Star } from 'lucide-react';
import React from 'react';
import { GrowthStock } from '../services/api';

interface StockCardProps {
  stock: GrowthStock;
  rank?: number;
  showDetails?: boolean;
  onViewDetails?: (stock: GrowthStock) => void;
}

export const StockCard: React.FC<StockCardProps> = ({ 
  stock, 
  rank, 
  showDetails = false,
  onViewDetails 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-600 bg-success-100';
    if (score >= 80) return 'text-warning-600 bg-warning-100';
    return 'text-danger-600 bg-danger-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '매우 높음';
    if (score >= 80) return '높음';
    if (score >= 70) return '보통';
    return '낮음';
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1_000_000_000_000) {
      return `$${(marketCap / 1_000_000_000_000).toFixed(1)}T`;
    }
    if (marketCap >= 1_000_000_000) {
      return `$${(marketCap / 1_000_000_000).toFixed(1)}B`;
    }
    if (marketCap >= 1_000_000) {
      return `$${(marketCap / 1_000_000).toFixed(1)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {rank && (
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">{rank}</span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{stock.symbol}</h3>
            <p className="text-sm text-gray-600">{stock.name}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(stock.score)}`}>
          {stock.score}점
        </div>
      </div>

      {/* 점수 바 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">성장 잠재력</span>
          <span className="text-sm font-medium text-gray-900">{getScoreLabel(stock.score)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              stock.score >= 90 ? 'bg-success-500' :
              stock.score >= 80 ? 'bg-warning-500' : 'bg-danger-500'
            }`}
            style={{ width: `${stock.score}%` }}
          ></div>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">시가총액</p>
          <p className="text-sm font-medium text-gray-900">
            {formatMarketCap(stock.metrics.marketCap)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">P/E 비율</p>
          <p className="text-sm font-medium text-gray-900">
            {stock.metrics.pe > 0 ? stock.metrics.pe.toFixed(1) : 'N/A'}
          </p>
        </div>
      </div>

      {/* 추천 이유 */}
      {showDetails && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">추천 이유:</p>
          <div className="space-y-1">
            {stock.reasons.slice(0, 3).map((reason, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Star className="w-3 h-3 text-primary-600" />
                <span className="text-xs text-gray-600">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ETF 노출 정보 */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">ETF 노출</p>
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(stock)}
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
            >
              <Eye className="w-3 h-3" />
              <span>상세보기</span>
            </button>
          )}
        </div>
        <div className="space-y-1">
          {stock.etfExposure.map((exposure, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-gray-600">{exposure.etfSymbol}</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">{exposure.weight}%</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  exposure.position === 'top' ? 'bg-success-100 text-success-700' :
                  exposure.position === 'middle' ? 'bg-warning-100 text-warning-700' :
                  'bg-danger-100 text-danger-700'
                }`}>
                  {exposure.position === 'top' ? '상위' :
                   exposure.position === 'middle' ? '중위' : '하위'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
