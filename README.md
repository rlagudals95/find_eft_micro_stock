# Find ETF Stars - 월가 전문가의 숨은 보석 찾기

**실제 데이터 기반 ETF 성장주 분석 플랫폼**

전문가들이 소량으로 보유한 종목을 발굴하고, 재무/기술적 분석, 뉴스 센티먼트를 종합하여 투자 인사이트를 제공합니다.

📊 **실제 API 연동**: Yahoo Finance, Financial Modeling Prep, Finnhub  
🎯 **종합 분석**: 재무 건전성, 성장 잠재력, 밸류에이션, 시장 모멘텀  
🌟 **투자 점수**: 0-100점 기반 등급 시스템  
📈 **상승 가능성**: AI 기반 1개월/3개월 예측

## 🚀 핵심 기능 (MVP)

### 🌟 숨은 보석 찾기 (Hidden Gems)
**전문가들이 소량으로 담은 미래 성장주를 발견하세요**

#### 왜 소량 보유 종목인가?
- 펀드 매니저들은 미래 성장성이 높다고 판단되는 기업을 소량 매수
- '정찰병' 전략: 잠재력을 먼저 확인하는 용도
- 대중에게 덜 알려진 기업을 남들보다 먼저 발견

#### 분석 대상 ETF
- **ARKK (ARK Innovation ETF)**: 혁신 기술 중심
- **IVES (Dan IVES AI Revolution ETF)**: AI 혁명
- **GRNY (Fundstrat Granny Shots ETF)**: 대형주 성장
- **AOTG (AOT 성장 및 혁신 ETF)**: 성장 및 혁신

#### 발굴 알고리즘
- **0.1% ~ 2% 보유 종목** 집중 분석
- ETF 하위 보유 종목에서 잠재력 평가
- 보유 비중이 작을수록 높은 잠재력 점수
- 전문가가 주목하기 시작한 초기 단계 종목 우선

## 🛠 기술 스택

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Puppeteer**: 웹 스크래핑
- **Axios**: HTTP 클라이언트
- **Winston**: 로깅
- **Node-cron**: 스케줄링

### Frontend
- **React** + **TypeScript** + **Vite**
- **Tailwind CSS**: 스타일링
- **React Router**: 라우팅
- **Lucide React**: 아이콘
- **Chart.js**: 데이터 시각화

## 📦 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd find_etf_stars
```

### 2. 의존성 설치
```bash
# 루트 디렉토리에서
npm run install:all

# 또는 개별 설치
cd backend && npm install
cd ../frontend && npm install
```

### 3. 환경 변수 설정
```bash
# backend/env.example을 복사하여 .env 파일 생성
cp backend/env.example backend/.env

# .env 파일에서 API 키 설정 (선택사항)
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

### 4. 개발 서버 실행
```bash
# 백엔드와 프론트엔드 동시 실행
npm run dev

# 또는 개별 실행
npm run dev:backend  # 백엔드만 실행 (포트 5000)
npm run dev:frontend # 프론트엔드만 실행 (포트 3000)
```

### 5. 브라우저에서 확인
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:5001

## 🔧 API 엔드포인트

### ETF 관련
- `GET /api/etf` - 모든 ETF 목록 조회
- `GET /api/etf/:symbol` - 특정 ETF 상세 정보
- `GET /api/etf/:symbol/holdings` - ETF 보유 종목 조회
- `GET /api/etf/stock/:symbol` - 종목 상세 정보

### 분석 관련
- `GET /api/analysis/growth-stocks` - 성장주 분석 결과
- `GET /api/analysis/etf/:symbol/growth-stocks` - 특정 ETF의 성장주
- `GET /api/analysis/market-insights` - 시장 인사이트
- `POST /api/analysis/portfolio-analysis` - 포트폴리오 분석

## 📊 데이터 소스

### 1. ETF 공식 홈페이지
- ARK Invest (ARKK)
- Wedbush (IVES)
- Fundstrat (GRNY)
- AOT (AOTG)

### 2. 금융 데이터 API
- Yahoo Finance API (무료)
- Alpha Vantage API (무료/유료)

### 3. 데이터 수집 방식
- **웹 스크래핑**: Puppeteer를 사용한 동적 데이터 수집
- **API 호출**: REST API를 통한 실시간 데이터 수집
- **스케줄링**: 정기적인 데이터 업데이트

## 🎯 성장주 분석 알고리즘

### 점수 계산 기준
1. **시가총액 기반** (30점)
   - 100억 달러 미만: 30점
   - 500억 달러 미만: 20점
   - 1000억 달러 미만: 10점

2. **ETF 내 비중** (25점)
   - 1% 미만: 25점 (소액 보유)
   - 3% 미만: 15점
   - 5% 미만: 5점

3. **거래량** (15점)
   - 100만주 이상: 15점
   - 50만주 이상: 10점

4. **가격 변동성** (20점)
   - 5% 이상: 20점
   - 3% 이상: 10점

5. **P/E 비율** (10점)
   - 30 미만: 10점 (합리적 밸류에이션)

## 📈 사용법

### 1. 대시보드
- 전체 ETF 현황 및 통계
- 상위 성장주 미리보기
- 시장 인사이트

### 2. ETF 목록
- 분석 중인 ETF 목록
- 각 ETF의 상세 정보
- 보유 종목 및 비중 확인

### 3. 성장주 분석
- 점수별 성장주 필터링
- 추천 이유 및 분석 근거
- ETF 노출 정보

### 4. 시장 분석
- 섹터별 시장 동향
- 전문가 인사이트
- 투자 추천

## 🔄 데이터 업데이트

### 자동 스케줄링
- **일일 수집**: 매일 오전 9시 (미국 시장 개장 전)
- **주간 분석**: 매주 월요일 오전 8시
- **실시간**: API 호출 시 즉시 업데이트

### 수동 업데이트
```bash
# 백엔드에서 수동 데이터 수집
curl -X POST http://localhost:5000/api/etf/collect
```

## 🚀 배포

### Docker를 사용한 배포
```bash
# Docker 이미지 빌드
docker build -t etf-stars .

# 컨테이너 실행
docker run -p 3000:3000 -p 5000:5000 etf-stars
```

### 클라우드 배포
- **Frontend**: Vercel, Netlify
- **Backend**: AWS EC2, Google Cloud Run
- **Database**: AWS RDS, Google Cloud SQL

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해주세요.

---

**Find ETF Stars** - 월가 전문가의 숨은 보석을 찾아보세요! 💎
