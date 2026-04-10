#!/bin/bash
set -e

echo "🔍 빌드 확인 중..."
npm run build

echo "📦 변경사항 커밋 중..."
git add .

if git diff --cached --quiet; then
    echo "✅ 변경사항 없음 — 빌드만 확인됨"
    exit 0
fi

read -p "커밋 메시지: " msg
git commit -m "$msg"

echo "🚀 push 중..."
git push origin main

echo "✅ 배포 완료 — https://grandma-video-service.vercel.app"
