#!/bin/bash

echo "🚀 Find ETF Stars 시작 중..."

# 의존성 설치
echo "📦 의존성 설치 중..."
npm run install:all

# 백엔드 빌드
echo "🔧 백엔드 빌드 중..."
cd backend
npm run build
cd ..

# 프론트엔드 빌드
echo "🎨 프론트엔드 빌드 중..."
cd frontend
npm run build
cd ..

echo "✅ 빌드 완료!"
echo ""
echo "개발 서버를 시작하려면:"
echo "npm run dev"
echo ""
echo "또는 개별 실행:"
echo "백엔드: npm run dev:backend"
echo "프론트엔드: npm run dev:frontend"
