# AnyMemo

AnyMemo는 웹·모바일·데스크톱에서 같은 계정으로 메모가 실시간 동기화되는 크로스 플랫폼 메모장입니다. **코드 한 벌**(Vite + React)로 웹, PWA, 데스크톱(Tauri), 모바일(Capacitor)을 지원하는 것이 이 프로젝트의 핵심입니다. Supabase로 인증·동기화·오프라인 캐시(IndexedDB)를 처리합니다.

## 지원 플랫폼

| 환경 | 상태 | 설명 |
|------|------|------|
| 웹 | ✅ | [anymemo.vercel.app](https://anymemo.vercel.app) |
| PWA | ✅ | 홈 화면 추가, 오프라인 동기화 |
| Windows / macOS | 🔧 | Tauri v2 — `npm run tauri:dev` / `tauri:build` (`배포.md`) |
| iOS / Android (스토어) | ⏸️ | 추후 Capacitor — 당분간 PWA |

## 개발

```bash
npm install
cp .env.example .env.local   # Supabase 키 설정
npm run dev
```

```bash
npm run build        # 웹 프로덕션 빌드
npm run tauri:dev    # 데스크톱 개발 (Rust 필요)
npm run tauri:build  # Windows/macOS 설치 파일
```

자세한 배포 절차는 [배포.md](./배포.md), 로드맵은 [계획.md](./계획.md)를 참고하세요.
