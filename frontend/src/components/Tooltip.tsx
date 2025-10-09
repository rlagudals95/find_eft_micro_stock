import { HelpCircle } from 'lucide-react';
import React, { useState } from 'react';

interface TooltipProps {
  term: string;
  description: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ term, description }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        className="ml-1 inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-primary-600 transition-colors align-middle"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        aria-label={`${term} 설명 보기`}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
          <div className="font-semibold mb-1">{term}</div>
          <div className="text-gray-200">{description}</div>
          {/* 화살표 */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-8 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

// 용어 사전
export const STOCK_TERMS = {
  PER: {
    term: 'PER (주가수익비율)',
    description: '주가를 주당순이익으로 나눈 값입니다. 낮을수록 저평가된 것으로 볼 수 있어요. 예: PER 10 = 10년이면 투자금 회수 가능',
  },
  PBR: {
    term: 'PBR (주가순자산비율)',
    description: '주가를 주당순자산으로 나눈 값입니다. 1 미만이면 회사 자산보다 주가가 낮다는 뜻이에요.',
  },
  EPS: {
    term: 'EPS (주당순이익)',
    description: '회사가 벌어들인 순이익을 전체 주식 수로 나눈 값입니다. 높을수록 주주에게 돌아오는 이익이 많아요.',
  },
  ROE: {
    term: 'ROE (자기자본이익률)',
    description: '회사가 자기자본으로 얼마나 효율적으로 돈을 벌었는지 보여줘요. 20% 이상이면 우수한 편입니다.',
  },
  ROA: {
    term: 'ROA (총자산이익률)',
    description: '회사의 전체 자산으로 얼마나 이익을 냈는지 나타내요. 10% 이상이면 좋은 편입니다.',
  },
  DEBT_TO_EQUITY: {
    term: '부채비율',
    description: '회사가 빌린 돈이 자기 돈에 비해 얼마나 되는지 보여줘요. 낮을수록 안전한 회사입니다.',
  },
  CURRENT_RATIO: {
    term: '유동비율',
    description: '단기 부채를 갚을 수 있는 능력을 나타내요. 1.5 이상이면 안정적입니다.',
  },
  PROFIT_MARGIN: {
    term: '순이익률',
    description: '매출에서 순이익이 차지하는 비율이에요. 높을수록 효율적으로 돈을 버는 회사입니다.',
  },
  OPERATING_MARGIN: {
    term: '영업이익률',
    description: '본업으로 얼마나 이익을 내는지 보여줘요. 15% 이상이면 우수한 편입니다.',
  },
  EBITDA_MARGIN: {
    term: 'EBITDA 마진',
    description: '이자, 세금, 감가상각을 빼기 전 영업이익률이에요. 회사의 실제 돈 버는 능력을 보여줍니다.',
  },
  REVENUE_GROWTH: {
    term: '매출 성장률',
    description: '작년 대비 올해 매출이 얼마나 늘었는지 보여줘요. 높을수록 빠르게 성장하는 회사입니다.',
  },
  EARNINGS_GROWTH: {
    term: '이익 성장률',
    description: '작년 대비 올해 순이익이 얼마나 늘었는지 보여줘요. 매출보다 중요한 지표입니다.',
  },
  EPS_GROWTH: {
    term: 'EPS 성장률',
    description: '주당순이익이 작년 대비 얼마나 늘었는지 보여줘요. 주가 상승의 핵심 요인입니다.',
  },
  MARKET_CAP: {
    term: '시가총액',
    description: '회사의 전체 가치예요. 주가 × 전체 주식 수로 계산됩니다.',
  },
  FAIR_VALUE: {
    term: '적정 주가',
    description: '애널리스트들이 생각하는 합리적인 주가예요. 현재 주가와 비교해서 투자 판단에 참고할 수 있습니다.',
  },
  UPSIDE: {
    term: '상승 여력',
    description: '현재 주가에서 적정 주가까지 오를 수 있는 비율이에요. 플러스면 저평가, 마이너스면 고평가입니다.',
  },
  PSR: {
    term: 'PSR (주가매출비율)',
    description: '주가를 주당매출로 나눈 값입니다. 적자 기업이나 스타트업 평가에 유용해요.',
  },
};

