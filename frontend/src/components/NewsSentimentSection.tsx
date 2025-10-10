import React from 'react';
import { NewsSentiment } from '../services/api';

interface NewsSentimentSectionProps {
  sentiment: NewsSentiment;
  isLoading: boolean;
}

const NewsSentimentSection: React.FC<NewsSentimentSectionProps> = ({ sentiment, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!sentiment || sentiment.newsCount === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          📰 뉴스 감성 분석
        </h2>
        <p className="text-gray-500">최근 뉴스 데이터가 없습니다.</p>
      </div>
    );
  }

  const getSentimentEmoji = () => {
    if (sentiment.score > 0.3) return '😊';
    if (sentiment.score < -0.3) return '😟';
    return '😐';
  };

  const getSentimentColor = () => {
    if (sentiment.score > 0.3) return 'text-green-600';
    if (sentiment.score < -0.3) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSentimentLabel = () => {
    if (sentiment.score > 0.5) return '매우 긍정적';
    if (sentiment.score > 0.3) return '긍정적';
    if (sentiment.score > 0.1) return '약간 긍정적';
    if (sentiment.score > -0.1) return '중립';
    if (sentiment.score > -0.3) return '약간 부정적';
    if (sentiment.score > -0.5) return '부정적';
    return '매우 부정적';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        📰 뉴스 감성 분석
      </h2>

      {/* 감성 점수 게이지 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="text-4xl mr-3">{getSentimentEmoji()}</span>
            <div>
              <p className={`text-2xl font-bold ${getSentimentColor()}`}>
                {getSentimentLabel()}
              </p>
              <p className="text-sm text-gray-500">
                감성 점수: {sentiment.score.toFixed(2)} (최근 {sentiment.newsCount}개 뉴스)
              </p>
            </div>
          </div>
        </div>

        {/* 진행바 */}
        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-red-400"
            style={{ width: `${sentiment.negativeRatio}%` }}
          ></div>
          <div 
            className="absolute h-full bg-gray-400"
            style={{ 
              left: `${sentiment.negativeRatio}%`,
              width: `${sentiment.neutralRatio}%` 
            }}
          ></div>
          <div 
            className="absolute h-full bg-green-400"
            style={{ 
              left: `${sentiment.negativeRatio + sentiment.neutralRatio}%`,
              width: `${sentiment.positiveRatio}%` 
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-700">
              긍정 {sentiment.positiveRatio}% | 중립 {sentiment.neutralRatio}% | 부정 {sentiment.negativeRatio}%
            </span>
          </div>
        </div>
      </div>

      {/* 주요 키워드 */}
      {sentiment.keywords.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">🔑 주요 키워드</h3>
          <div className="flex flex-wrap gap-2">
            {sentiment.keywords.map((keyword, index) => (
              <span 
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 최신 뉴스 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">📋 최신 뉴스</h3>
        <div className="space-y-3">
          {sentiment.recentNews.map((news, index) => (
            <a
              key={index}
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">
                      {news.sentiment === 'positive' ? '🟢' : news.sentiment === 'negative' ? '🔴' : '⚪'}
                    </span>
                    <h4 className="font-medium text-gray-900 line-clamp-2">
                      {news.title}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {news.source} • {new Date(news.publishedAt).toLocaleDateString('ko-KR')}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {news.summary}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 마지막 업데이트 시간 */}
      <p className="text-xs text-gray-400 mt-4 text-right">
        마지막 업데이트: {new Date(sentiment.lastUpdated).toLocaleString('ko-KR')}
      </p>
    </div>
  );
};

export default NewsSentimentSection;

