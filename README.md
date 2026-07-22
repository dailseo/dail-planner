# DAIL Planner

다일의 콘텐츠 기획과 아이디어 관리를 위한 모바일 우선 React 웹앱입니다.

## 현재 기능

- 월간 콘텐츠 캘린더
- 캐러셀/릴스 일정 등록
- 예정/작업 중/완료 상태 관리
- 아이디어 인박스
- 아이디어를 일정으로 전환
- 브라우저 자동 저장
- JSON 데이터 백업
- 모바일 및 PC 반응형 화면

## 로컬 실행

```bash
npm install
npm run dev
```

## GitHub Pages

`main` 브랜치에 파일을 올리면 GitHub Actions가 자동으로 빌드하고 Pages에 배포합니다.

저장소의 `Settings → Pages → Source`에서 **GitHub Actions**를 선택하세요.

배포 주소:

`https://dailseo.github.io/dail-planner/`

## 저장 방식

현재 데이터는 사용 중인 브라우저의 `localStorage`에 저장됩니다.
다른 기기와 자동 동기화되지는 않습니다.
