import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { NewsArticleDto, NewsSentimentDto } from '../dto/news-sentiment.dto';

interface NewsAPIArticle {
  title: string;
  source: { name: string };
  publishedAt: string;
  url: string;
  description: string;
}

@Injectable()
export class NewsSentimentService {
  private readonly logger = new Logger(NewsSentimentService.name);
  
  // News API Key (무료: https://newsapi.org/)
  // 실제 사용 시 환경변수로 관리: process.env.NEWS_API_KEY
  private readonly NEWS_API_KEY = process.env.NEWS_API_KEY || 'demo'; // 'demo'는 제한된 데이터만 제공
  private readonly NEWS_API_URL = 'https://newsapi.org/v2/everything';

  async getNewsSentiment(symbol: string, companyName: string): Promise<NewsSentimentDto> {
    try {
      this.logger.log(`Fetching news sentiment for ${symbol}...`);

      // 1. 뉴스 데이터 수집
      const articles = await this.fetchNews(symbol, companyName);

      if (articles.length === 0) {
        return this.getEmptyResponse();
      }

      // 2. 각 뉴스의 감성 분석
      const analyzedArticles = await this.analyzeArticles(articles);

      // 3. 통계 계산
      const stats = this.calculateStats(analyzedArticles);

      // 4. 주요 키워드 추출
      const keywords = this.extractKeywords(analyzedArticles);

      return {
        score: stats.averageScore,
        positiveRatio: stats.positiveRatio,
        negativeRatio: stats.negativeRatio,
        neutralRatio: stats.neutralRatio,
        newsCount: analyzedArticles.length,
        keywords,
        recentNews: analyzedArticles.slice(0, 3),
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error fetching news sentiment for ${symbol}:`, error);
      return this.getEmptyResponse();
    }
  }

  private async fetchNews(symbol: string, companyName: string): Promise<NewsAPIArticle[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // 주식/금융 관련 키워드를 포함한 검색 쿼리
      // 심볼은 반드시 포함하고, 주식 관련 키워드도 함께 검색
      const query = `"${symbol}" AND (stock OR shares OR trading OR earnings OR revenue OR investor OR market OR financial OR "stock price" OR IPO OR SEC OR "quarterly results")`;
      
      const response = await axios.get(this.NEWS_API_URL, {
        params: {
          q: query,
          from: sevenDaysAgo.toISOString(),
          sortBy: 'relevancy', // 'publishedAt' 대신 'relevancy' 사용
          language: 'en',
          apiKey: this.NEWS_API_KEY,
          pageSize: 50, // 많이 가져온 후 필터링
        },
        timeout: 10000,
      });

      const articles = response.data.articles || [];
      
      // 주식 관련 뉴스만 필터링
      return this.filterStockRelatedNews(articles, symbol, companyName);
    } catch (error) {
      this.logger.error('Error fetching news from News API:', error.message);
      return [];
    }
  }

  private filterStockRelatedNews(
    articles: NewsAPIArticle[],
    symbol: string,
    companyName: string
  ): NewsAPIArticle[] {
    const stockKeywords = [
      'stock', 'shares', 'trading', 'earnings', 'revenue', 'investor',
      'market', 'financial', 'price', 'ipo', 'sec', 'quarterly',
      'profit', 'loss', 'dividend', 'analyst', 'upgrade', 'downgrade',
      'valuation', 'eps', 'guidance', 'forecast', 'outlook', 'results'
    ];

    // 제외할 키워드 (연예, 스포츠, 라이프스타일 등)
    const excludeKeywords = [
      'celebrity', 'gossip', 'kardashian', 'wedding', 'divorce', 'dating',
      'movie', 'tv show', 'concert', 'album', 'song', 'actor', 'actress',
      'football', 'basketball', 'soccer', 'nfl', 'nba', 'mlb',
      'fashion', 'beauty', 'makeup', 'hairstyle', 'outfit', 'red carpet',
      'surgery', 'injury', 'hospital', 'health', 'diet', 'workout',
      'recipe', 'cooking', 'restaurant', 'food', 'travel', 'vacation'
    ];

    return articles.filter(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      
      // 1. 심볼이 반드시 포함되어야 함 (대소문자 구분)
      const symbolRegex = new RegExp(`\\b${symbol}\\b`, 'i');
      if (!symbolRegex.test(article.title) && !symbolRegex.test(article.description || '')) {
        return false;
      }

      // 2. 제외 키워드가 있으면 필터링
      const hasExcludeKeyword = excludeKeywords.some(keyword => text.includes(keyword));
      if (hasExcludeKeyword) {
        return false;
      }

      // 3. 주식 관련 키워드가 최소 1개 이상 있어야 함
      const hasStockKeyword = stockKeywords.some(keyword => text.includes(keyword));
      if (!hasStockKeyword) {
        return false;
      }

      // 4. 신뢰할 수 있는 금융 뉴스 소스 우선
      const financialSources = [
        'reuters', 'bloomberg', 'cnbc', 'marketwatch', 'wsj', 'ft.com',
        'barrons', 'seekingalpha', 'investopedia', 'forbes', 'benzinga',
        'yahoo finance', 'investing.com', 'thestreet', 'fool.com'
      ];
      
      const sourceName = article.source.name.toLowerCase();
      const isFinancialSource = financialSources.some(source => sourceName.includes(source));
      
      // 금융 소스는 바로 통과, 아니면 더 엄격한 필터 적용
      if (isFinancialSource) {
        return true;
      }

      // 일반 소스는 주식 키워드가 2개 이상 있어야 함
      const stockKeywordCount = stockKeywords.filter(keyword => text.includes(keyword)).length;
      return stockKeywordCount >= 2;
    }).slice(0, 20); // 최대 20개로 제한
  }

  private async analyzeArticles(articles: NewsAPIArticle[]): Promise<NewsArticleDto[]> {
    const analyzed: NewsArticleDto[] = [];

    for (const article of articles) {
      try {
        // 간단한 키워드 기반 감성 분석 (OpenAI 사용 시 더 정확)
        const sentiment = this.analyzeSentimentSimple(article.title, article.description);
        
        analyzed.push({
          title: article.title,
          source: article.source.name,
          publishedAt: article.publishedAt,
          sentiment,
          url: article.url,
          summary: article.description || article.title,
        });
      } catch (error) {
        this.logger.error('Error analyzing article:', error);
      }
    }

    return analyzed;
  }

  private analyzeSentimentSimple(title: string, description: string): 'positive' | 'negative' | 'neutral' {
    const text = `${title} ${description}`.toLowerCase();

    // 긍정 키워드
    const positiveKeywords = [
      'surge', 'soar', 'jump', 'rally', 'gain', 'rise', 'up', 'high', 'record',
      'breakthrough', 'success', 'growth', 'profit', 'beat', 'exceed', 'strong',
      'positive', 'optimistic', 'bullish', 'upgrade', 'buy', 'outperform',
      'innovation', 'deal', 'partnership', 'expansion', 'revenue', 'earnings'
    ];

    // 부정 키워드
    const negativeKeywords = [
      'fall', 'drop', 'plunge', 'decline', 'down', 'low', 'loss', 'miss', 'weak',
      'negative', 'pessimistic', 'bearish', 'downgrade', 'sell', 'underperform',
      'concern', 'risk', 'trouble', 'lawsuit', 'investigation', 'recall',
      'bankruptcy', 'layoff', 'cut', 'reduce', 'warning', 'crisis'
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    positiveKeywords.forEach(keyword => {
      if (text.includes(keyword)) positiveCount++;
    });

    negativeKeywords.forEach(keyword => {
      if (text.includes(keyword)) negativeCount++;
    });

    if (positiveCount > negativeCount + 1) return 'positive';
    if (negativeCount > positiveCount + 1) return 'negative';
    return 'neutral';
  }

  private calculateStats(articles: NewsArticleDto[]): {
    averageScore: number;
    positiveRatio: number;
    negativeRatio: number;
    neutralRatio: number;
  } {
    const total = articles.length;
    if (total === 0) {
      return { averageScore: 0, positiveRatio: 0, negativeRatio: 0, neutralRatio: 0 };
    }

    const positive = articles.filter(a => a.sentiment === 'positive').length;
    const negative = articles.filter(a => a.sentiment === 'negative').length;
    const neutral = articles.filter(a => a.sentiment === 'neutral').length;

    // 점수: 긍정 +1, 중립 0, 부정 -1
    const averageScore = ((positive - negative) / total);

    return {
      averageScore: Math.round(averageScore * 100) / 100,
      positiveRatio: Math.round((positive / total) * 100),
      negativeRatio: Math.round((negative / total) * 100),
      neutralRatio: Math.round((neutral / total) * 100),
    };
  }

  private extractKeywords(articles: NewsArticleDto[]): string[] {
    // 간단한 키워드 추출 (실제로는 NLP 라이브러리 사용 권장)
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
    ]);

    const wordCounts = new Map<string, number>();

    articles.forEach(article => {
      const words = article.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/);

      words.forEach(word => {
        if (word.length > 3 && !commonWords.has(word)) {
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
      });
    });

    // 빈도순으로 정렬하여 상위 5개 반환
    return Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private getEmptyResponse(): NewsSentimentDto {
    return {
      score: 0,
      positiveRatio: 0,
      negativeRatio: 0,
      neutralRatio: 0,
      newsCount: 0,
      keywords: [],
      recentNews: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

