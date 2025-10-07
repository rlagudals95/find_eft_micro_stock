import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { ETFList } from './pages/ETFList';
import { HiddenGems } from './pages/HiddenGems';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HiddenGems />} />
              <Route path="/etfs" element={<ETFList />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
