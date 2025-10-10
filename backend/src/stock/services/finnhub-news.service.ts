import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { NewsArticleDto, NewsSentimentDto } from '../dto/news-sentiment.dto';

interface FinnhubNewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

@Injectable()
export class FinnhubNewsService {
  private readonly logger = new Logger(FinnhubNewsService.name);
  
  // Finnhub API Key (무료: https://finnhub.io/)
  // 무료 플랜: 60 calls/minute, 주식 전용 뉴스!
  private readonly FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'demo';
  private readonly FINNHUB_NEWS_URL = 'https://finnhub.io/api/v1/company-news';

  async getNewsSentiment(symbol: string): Promise<NewsSentimentDto> {
    try {
      this.logger.log(`Fetching news sentiment from Finnhub for ${symbol}...`);

      // 1. Finnhub에서 뉴스 가져오기
      const articles = await this.fetchFinnhubNews(symbol);

      if (articles.length === 0) {
        return this.getEmptyResponse();
      }

      // 2. 각 뉴스의 감성 분석
      const analyzedArticles = this.analyzeArticles(articles);

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
      this.logger.error(`Error fetching Finnhub news for ${symbol}:`, error);
      return this.getEmptyResponse();
    }
  }

  private async fetchFinnhubNews(symbol: string): Promise<FinnhubNewsItem[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const fromDate = sevenDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD
      const toDate = new Date().toISOString().split('T')[0];

      const response = await axios.get(this.FINNHUB_NEWS_URL, {
        params: {
          symbol: symbol,
          from: fromDate,
          to: toDate,
          token: this.FINNHUB_API_KEY,
        },
        timeout: 10000,
      });

      return response.data || [];
    } catch (error) {
      this.logger.error('Error fetching news from Finnhub:', error.message);
      return [];
    }
  }

  private analyzeArticles(articles: FinnhubNewsItem[]): NewsArticleDto[] {
    return articles.map(article => {
      const sentiment = this.analyzeSentimentSimple(article.headline, article.summary);
      
      return {
        title: article.headline,
        source: article.source,
        publishedAt: new Date(article.datetime * 1000).toISOString(),
        sentiment,
        url: article.url,
        summary: article.summary,
      };
    });
  }

  private analyzeSentimentSimple(title: string, summary: string): 'positive' | 'negative' | 'neutral' {
    const text = `${title} ${summary}`.toLowerCase();

    // 긍정 키워드
    const positiveKeywords = [
      'surge', 'soar', 'jump', 'rally', 'gain', 'rise', 'up', 'high', 'record',
      'breakthrough', 'success', 'growth', 'profit', 'beat', 'exceed', 'strong',
      'positive', 'optimistic', 'bullish', 'upgrade', 'buy', 'outperform',
      'innovation', 'deal', 'partnership', 'expansion', 'revenue', 'earnings',
      'boost', 'climb', 'advance', 'improve', 'increase', 'wins', 'recovery'
    ];

    // 부정 키워드
    const negativeKeywords = [
      'fall', 'drop', 'plunge', 'decline', 'down', 'low', 'loss', 'miss', 'weak',
      'negative', 'pessimistic', 'bearish', 'downgrade', 'sell', 'underperform',
      'concern', 'risk', 'trouble', 'lawsuit', 'investigation', 'recall',
      'bankruptcy', 'layoff', 'cut', 'reduce', 'warning', 'crisis', 'plummet',
      'slump', 'disappointing', 'struggle', 'challenge', 'threat', 'failure'
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

    const averageScore = ((positive - negative) / total);

    return {
      averageScore: Math.round(averageScore * 100) / 100,
      positiveRatio: Math.round((positive / total) * 100),
      negativeRatio: Math.round((negative / total) * 100),
      neutralRatio: Math.round((neutral / total) * 100),
    };
  }

  private extractKeywords(articles: NewsArticleDto[]): string[] {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
      'stock', 'stocks', 'share', 'shares', 'company', 'companies'
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

