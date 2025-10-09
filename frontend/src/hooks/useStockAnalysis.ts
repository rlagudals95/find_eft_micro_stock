import { useQuery } from '@tanstack/react-query';
import { stockApi } from '../services/api';

export const useStockAnalysis = (symbol: string) => {
  return useQuery({
    queryKey: ['stock', 'analysis', symbol.toUpperCase()],
    queryFn: async () => {
      const response = await stockApi.getStockAnalysis(symbol.toUpperCase());
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    enabled: !!symbol, // symbol이 있을 때만 쿼리 실행
  });
};

