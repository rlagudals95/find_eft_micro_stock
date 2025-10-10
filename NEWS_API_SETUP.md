# 뉴스 감성 분석 API 설정 가이드

## ⚠️ 중요 변경사항

**News API의 문제점을 발견하여 Finnhub로 전환했습니다!**

### 문제점:
- News API는 주식과 무관한 뉴스를 많이 가져옴 (연예, 스포츠 등)
- 검색 정확도가 떨어짐
- 필터링이 복잡함

### 해결책:
- **Finnhub API 사용 (주식 전용 뉴스)** ✅ 추천!
- 더 정확한 주식 뉴스만 제공
- 무료 플랜: 60 calls/minute

---

## 1. Finnhub API 키 발급받기 (추천)

### 무료 플랜
1. [https://finnhub.io/](https://finnhub.io/) 방문
2. "Get free API key" 클릭
3. 이메일로 회원가입
4. API 키 복사

**무료 플랜 제한사항:**
- ✅ 60 API calls/minute
- ✅ 주식 전용 뉴스 (정확도 높음)
- ✅ 실시간 데이터
- ✅ 개발/테스트용으로 충분함

**유료 플랜:**
- $59/월 - 300 calls/minute
- $119/월 - 600 calls/minute
- 더 많은 데이터 포인트

---

## 2. (선택) News API 키 발급받기

News API도 개선된 필터링으로 계속 사용 가능합니다.

### 무료 플랜
1. [https://newsapi.org/](https://newsapi.org/) 방문
2. "Get API Key" 클릭
3. 이메일로 회원가입
4. API 키 복사

**무료 플랜 제한사항:**
- ✅ 100 requests/day
- ✅ 최근 30일 뉴스만 조회 가능
- ⚠️ 주식 외 뉴스도 포함 (필터링 적용됨)

---

## 3. 환경변수 설정

### Backend 설정

1. `backend/.env` 파일 생성:
```bash
cd backend
touch .env
```

2. `.env` 파일에 API 키 추가:
```env
# Server Configuration
PORT=5001

# News Source (finnhub 또는 newsapi)
NEWS_SOURCE=finnhub

# Finnhub API Configuration (추천)
FINNHUB_API_KEY=your_finnhub_api_key_here

# News API Configuration (선택)
NEWS_API_KEY=your_newsapi_key_here
```

**설정 옵션:**
- `NEWS_SOURCE=finnhub` (기본값, 추천) - 주식 전용 뉴스
- `NEWS_SOURCE=newsapi` - 더 많은 소스, 하지만 필터링 필요

**중요:** `.env` 파일은 `.gitignore`에 포함되어야 합니다!

---

## 3. 백엔드 서버 재시작

```bash
cd backend
npm run dev
```

---

## 4. 테스트

### API 테스트 (Swagger)
1. 브라우저에서 `http://localhost:5001/api` 접속
2. `Stock` 섹션에서 `GET /stock/{symbol}/news-sentiment` 찾기
3. TSLA 입력 후 "Try it out" 클릭

### 프론트엔드 테스트
1. 브라우저에서 `http://localhost:3000` 접속
2. Hidden Gems 페이지에서 아무 종목 클릭
3. 주식 상세 페이지에서 "뉴스 감성 분석" 섹션 확인

---

## 5. 대안 (무료 데이터 소스)

News API 키가 없거나 제한이 있는 경우:

### Option 1: Finnhub (무료)
```typescript
// backend/src/stock/services/news-sentiment.service.ts
private readonly FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
private readonly FINNHUB_NEWS_URL = 'https://finnhub.io/api/v1/company-news';

// 무료: 60 calls/minute
// https://finnhub.io/
```

### Option 2: Alpha Vantage (무료)
```typescript
private readonly ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
private readonly ALPHA_VANTAGE_NEWS_URL = 'https://www.alphavantage.co/query?function=NEWS_SENTIMENT';

// 무료: 25 calls/day
// https://www.alphavantage.co/
```

### Option 3: RSS 피드 (완전 무료)
```typescript
// Google News RSS
const RSS_URL = `https://news.google.com/rss/search?q=${symbol}+stock&hl=en-US&gl=US&ceid=US:en`;

// 제한 없음, 하지만 구조화된 데이터 제공 안함
```

---

## 6. 현재 구현 상태

### ✅ 완료된 기능
1. **뉴스 데이터 수집**
   - News API 연동
   - 최근 7일 뉴스 자동 수집
   - 주식 심볼 + 회사명으로 검색

2. **감성 분석**
   - 키워드 기반 감성 분석 (긍정/부정/중립)
   - 감성 점수 계산 (-1 ~ 1)
   - 뉴스별 감성 태깅

3. **UI 시각화**
   - 감성 점수 게이지
   - 긍정/중립/부정 비율 차트
   - 주요 키워드 표시
   - 최신 뉴스 3개 링크

4. **캐싱**
   - React Query로 5분 캐싱
   - 중복 API 호출 방지

### 🔄 개선 가능한 부분

1. **AI 감성 분석 (고급)**
   ```typescript
   // OpenAI GPT-4 사용
   const sentiment = await openai.chat.completions.create({
     model: "gpt-4",
     messages: [{
       role: "system",
       content: "뉴스 제목을 분석하여 긍정/부정/중립 판단해주세요"
     }]
   });
   ```
   - 비용: ~$0.01/뉴스
   - 정확도: 키워드 방식보다 훨씬 높음

2. **실시간 알림**
   - 중요 뉴스 발생 시 알림
   - WebSocket 또는 Server-Sent Events

3. **뉴스 임팩트 점수**
   - 주가 변동과 상관관계 분석
   - 과거 데이터 학습

---

## 7. 트러블슈팅

### 문제: "API key is invalid"
- `.env` 파일이 제대로 로드되지 않음
- 백엔드 서버 재시작 필요
- API 키 복사 시 공백 제거 확인

### 문제: "Rate limit exceeded"
- 무료 플랜: 100 calls/day 초과
- 해결: Redis로 캐싱 구현 또는 유료 플랜 전환

### 문제: "No news found"
- 일부 종목은 뉴스가 거의 없음
- 회사명이 일반적인 단어인 경우 (예: "Apple")
- 검색 쿼리 개선 필요

---

## 8. 다음 단계

### Phase 2: 기술적 분석 (차트)
- RSI, MACD 지표 추가
- 매수/매도 신호 생성

### Phase 3: 섹터 분석
- 경쟁사 비교
- 시장 점유율 분석

### Phase 4: 내부자 거래
- SEC EDGAR 공시 모니터링
- 임원진 매수/매도 추적

---

## 문의 및 피드백

뉴스 감성 분석 기능에 대한 피드백이나 버그 리포트는 이슈로 남겨주세요!

