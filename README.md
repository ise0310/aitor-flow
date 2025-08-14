# AITOR Flow (Survey → Recommend → Chat → Level Test → Plan)

## 배포 순서 (GitHub → Vercel)
1) 이 폴더를 그대로 새 GitHub 레포에 푸시
2) Vercel에서 Import → `Environment Variables`에 `OPENAI_API_KEY` 추가
3) Deploy 후 `/aitor/index.html` 접속해서 플로우 진행

## 구조
- `/aitor/*.html` : 정적 페이지(서베이/추천/채팅/레벨/코스)
- `/aitor/characters` : 캐릭터 말투/규칙 JSON
- `/aitor/prompts` : 공통 규칙, 코스 생성, 피드백 템플릿
- `/aitor/archetype` : 학생 유형 규칙 JSON
- `/api/*.js` : 서버리스 함수 (OpenAI 연동)

## 주의
- 비밀키는 코드에 넣지 말고 **Vercel 환경변수**로만 관리
- 모델이 JSON이 아닌 텍스트를 반환하면 `raw` 필드를 참고
