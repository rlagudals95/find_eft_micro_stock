import { ApiProperty } from '@nestjs/swagger';

export class NewsArticleDto {
  @ApiProperty({ example: 'Tesla announces new battery technology', description: '뉴스 제목' })
  title: string;

  @ApiProperty({ example: 'Reuters', description: '출처' })
  source: string;

  @ApiProperty({ example: '2025-10-09T10:00:00Z', description: '발행 시간' })
  publishedAt: string;

  @ApiProperty({ enum: ['positive', 'negative', 'neutral'], example: 'positive', description: '감성' })
  sentiment: 'positive' | 'negative' | 'neutral';

  @ApiProperty({ example: 'https://example.com/news/1', description: '뉴스 URL' })
  url: string;

  @ApiProperty({ example: 'Tesla announced breakthrough in battery technology...', description: '요약' })
  summary: string;
}

export class NewsSentimentDto {
  @ApiProperty({ example: 0.65, description: '뉴스 감성 점수 (-1 ~ 1)', minimum: -1, maximum: 1 })
  score: number;

  @ApiProperty({ example: 70, description: '긍정 뉴스 비율 (%)', minimum: 0, maximum: 100 })
  positiveRatio: number;

  @ApiProperty({ example: 20, description: '부정 뉴스 비율 (%)', minimum: 0, maximum: 100 })
  negativeRatio: number;

  @ApiProperty({ example: 10, description: '중립 뉴스 비율 (%)', minimum: 0, maximum: 100 })
  neutralRatio: number;

  @ApiProperty({ example: 15, description: '최근 7일 뉴스 수' })
  newsCount: number;

  @ApiProperty({ example: ['AI', '실적 개선', '신제품'], description: '주요 키워드', type: [String] })
  keywords: string[];

  @ApiProperty({ type: [NewsArticleDto], description: '최신 뉴스 3개' })
  recentNews: NewsArticleDto[];

  @ApiProperty({ example: '2025-10-09T10:00:00Z', description: '마지막 업데이트' })
  lastUpdated: string;
}

