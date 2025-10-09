import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { ETFList } from './pages/ETFList';
import { HiddenGems } from './pages/HiddenGems';
import { StockDetail } from './pages/StockDetail';

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분 동안 데이터를 fresh 상태로 유지
      gcTime: 10 * 60 * 1000, // 10분 동안 캐시 유지 (이전 cacheTime)
      retry: 1, // 실패 시 1번만 재시도
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HiddenGems />} />
                <Route path="/etfs" element={<ETFList />} />
                <Route path="/stock/:symbol" element={<StockDetail />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ErrorBoundary>
      {/* 개발 환경에서만 React Query Devtools 표시 */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
