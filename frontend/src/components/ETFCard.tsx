import { ArrowRight, Eye } from 'lucide-react';
import React from 'react';
import { ETF } from '../services/api';

interface ETFCardProps {
  etf: ETF;
  isSelected?: boolean;
  onSelect?: (etf: ETF) => void;
  onViewDetails?: (etf: ETF) => void;
}

export const ETFCard: React.FC<ETFCardProps> = ({ 
  etf, 
  isSelected = false,
  onSelect,
  onViewDetails 
}) => {
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect?.(etf)}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{etf.symbol}</h3>
          <p className="text-sm text-gray-600">{etf.name}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <span className="text-gray-500">수수료</span>
          <p className="font-medium">{etf.expenseRatio}%</p>
        </div>
        <div>
          <span className="text-gray-500">자산</span>
          <p className="font-medium">{formatCurrency(etf.totalAssets)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          설립: {new Date(etf.inceptionDate).getFullYear()}
        </div>
        {onViewDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(etf);
            }}
            className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
          >
            <Eye className="w-3 h-3" />
            <span>상세보기</span>
          </button>
        )}
      </div>
    </div>
  );
};
