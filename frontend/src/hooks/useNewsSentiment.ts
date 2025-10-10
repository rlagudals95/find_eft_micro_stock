import { useQuery } from '@tanstack/react-query';
import { NewsSentiment, stockApi } from '../services/api';

export const useNewsSentiment = (symbol: string) => {
  return useQuery<NewsSentiment>({
    queryKey: ['newsSentiment', symbol],
    queryFn: async () => {
      const response = await stockApi.getNewsSentiment(symbol);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5분 동안 fresh
    gcTime: 30 * 60 * 1000, // 30분 동안 캐시 유지
    retry: 2,
  });
};

