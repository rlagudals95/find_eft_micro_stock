import { useQuery } from '@tanstack/react-query';
import { etfApi } from '../services/api';

export const useETFsWithHoldings = () => {
  return useQuery({
    queryKey: ['etfs', 'all-holdings'],
    queryFn: async () => {
      const response = await etfApi.getAllETFsWithHoldings();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10분 - ETF 데이터는 자주 변경되지 않음
    gcTime: 30 * 60 * 1000, // 30분
  });
};

