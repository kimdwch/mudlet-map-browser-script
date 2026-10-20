# Mudlet Map Browser Script

[English](README.md) | **한국어**

[Mudlet](https://www.mudlet.org/) 맵을 탐색하기 위한 브라우저 프런트엔드입니다.
[`mudlet-map-renderer`](https://www.npmjs.com/package/mudlet-map-renderer)를 기반으로 지역 탐색,
방 검색, 경로 찾기, 이미지 내보내기, 다양한 시각 스타일 등을 갖춘 인터랙티브 UI를 제공하므로
Mudlet 맵 내보내기 파일을 웹 페이지에서 바로 둘러볼 수 있습니다.

실행 중인 배포 버전은 **[https://kimdwch.github.io/mudlet-map-browser-script/](https://kimdwch.github.io/mudlet-map-browser-script/)** 에서 확인할 수 있습니다.

## 주요 기능

- **지역 및 레벨 탐색** — 이름순으로 정렬된 지역 드롭다운과 레벨별(`z-index`) 버튼을 제공합니다.
  레벨이 10개를 초과하는 지역에서는 드롭다운으로 전환됩니다.
- **방 정보 확인** — 방을 클릭하면 ID, 이름, 환경, 좌표, 해시, 일반 및 특수 출구(다른 지역으로
  연결되는 링크 포함), 사용자 지정 Mudlet 데이터, 해당 방에 있는 NPC를 확인할 수 있습니다.
- **검색** — 방 ID(하나 또는 쉼표로 구분된 여러 ID)나 자동 완성 기능이 있는 NPC 이름으로
  방을 찾습니다. 검색된 방은 화면 중앙에 표시되고 강조됩니다.
- **경로 찾기** — 두 방 사이의 최단 경로를 다익스트라 알고리즘으로 찾습니다. 여러 경로를
  동시에 표시할 수 있으며, 각 경로의 색상을 따로 변경하거나 개별적으로 삭제할 수 있습니다.
- **이미지 내보내기** — 현재 지역을 **PNG** 또는 **SVG**로 다운로드하거나 PNG를 클립보드에
  바로 복사할 수 있습니다.
- **렌더링 모드** — 맵의 시각 스타일을 전환합니다: `normal`, `pencil`(스케치),
  `parchment`, `parchment-pencil`, `isometric`(회전 조절 가능), `isometric-parchment`,
  `blueprint`, `neon`, `gradient`.
- **사용자 지정 설정** — 배경 및 선 색상, 방 크기와 모양, 선 너비, 레이블 표시, 지역 이름,
  지역 출구 레이블 등을 설정할 수 있습니다. 설정은 `localStorage`에 저장되며 버전이 바뀌어도
  이전 설정이 마이그레이션됩니다.
- **미니맵 미리 보기** — 현재 지역을 저해상도 오버레이로 표시하고 확대/축소 및 이동에 따라
  실시간으로 갱신되는 표시 영역을 보여 줍니다.
- **키보드 단축키** — `F1` 도움말, `Ctrl+F` 검색, `Ctrl+S` 이미지 저장, `+`/`-` 확대/축소,
  숫자 키패드(`1`–`9`, `*`, `/`)로 선택한 방의 출구를 차례로 탐색할 수 있습니다.
- **다국어 지원** — 한국어(KO)/폴란드어/영어 번역이 내장되어 있으며 UI에서 언어를 전환할 수 있습니다.
  기본 언어는 한국어이며, 언어 선택기의 태극기로 한국어를 선택할 수 있습니다.
  선택한 언어는 다음 방문에도 유지됩니다.
- **테마 선택기** — 원하는 [Bootswatch](https://bootswatch.com/) 테마와 다크 모드를 선택할 수
  있으며 설정은 `localStorage`에 저장됩니다.
- **버전 전환기** — GitHub 릴리스 태그에 게시된 이전 맵 버전을 불러오고 페이지를 벗어나지
  않은 채 릴리스 노트를 확인할 수 있습니다.
- **딥 링크** — 특정 방(`?loc=`), 지역(`?area=`) 또는 맵 버전(`?version=`)이 열린 상태로
  페이지를 표시합니다.

## 사용법

이 스크립트는 npm에 배포되며, 번들된 IIFE(`dist/index.min.js`)와 스타일시트
(`dist/index.min.css`)를 브라우저에서 사용합니다. 가장 간단한 방법은 다음과 같은 CDN을 통해
불러오는 것입니다.
[jsDelivr](https://www.jsdelivr.com/package/npm/mudlet-map-browser-script):

```html
<!-- 최신 버전 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mudlet-map-browser-script/dist/index.min.css" />
<script src="https://cdn.jsdelivr.net/npm/mudlet-map-browser-script/dist/index.min.js"></script>

<!-- 버전 지정 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mudlet-map-browser-script@0.9.0/dist/index.min.css" />
<script src="https://cdn.jsdelivr.net/npm/mudlet-map-browser-script@0.9.0/dist/index.min.js"></script>
```

직접 번들하려면 npm에서 설치할 수도 있습니다.

```bash
npm install mudlet-map-browser-script
# 또는
yarn add mudlet-map-browser-script
```

### 맵 데이터 소스

`window.MAP_CONFIG`를 통해 스크립트가 사용할 맵을 지정합니다. 다음 세 가지 방법을 순서대로
확인합니다.

| 설정                        | 소스                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| `mapUrl`                    | Mudlet 바이너리 맵(`.dat`) — 브라우저에서 [`mudlet-map-binary-reader`][reader]로 디코딩 — 또는 `{ mapData, colors }`를 포함한 JSON 파일(확장자로 형식 판별). |
| `mapDataUrl` + `colorsUrl`  | 렌더러 내보내기 데이터를 두 개의 JSON 배열로 제공합니다(기존 `mapExport.js` / `colors.js`의 `.json` 버전). |
| _레거시 전역 변수_          | 스크립트 실행 전에 `window`에 정의된 `mapData` / `colors`. **사용 중단 예정** — 이전 버전과의 호환성을 위해 유지됩니다. `mapUrl` 사용을 권장합니다. |

[reader]: https://github.com/Delwing/node-mudlet-map-binary-reader

`.dat` 파일을 직접 불러오는 것이 가장 간단합니다. 별도의 내보내기 과정이 필요 없고 바이너리
파일은 생성된 JS보다 크기가 작습니다. `mudlet-map-binary-reader` 1.0.1 이상이 필요하며
`dist/index.min.js`에 번들되어 있습니다.

### 필수 페이지 구조

이 스크립트는 UI 전체를 직접 렌더링하는 독립형 **React** 애플리케이션입니다. 호스트 페이지에는
렌더링을 위한 마운트 지점(기존 `#root` 요소가 있으면 사용하고, 없으면 새로 만들어 `<body>`에
추가)과 설정된 맵 소스만 있으면 됩니다.

```html
<link rel="stylesheet" href="index.min.css" />
<div id="root"></div>
<script>
  window.MAP_CONFIG = { mapUrl: "data/map.dat" }; // 브라우저에서 디코딩되는 .dat 또는 .json 내보내기 파일
</script>
<script src="index.min.js"></script>
```

모든 스타일(Bootstrap, 앱 자체 CSS, 국기 스프라이트)은 `dist/index.min.css`에 포함되어 있으므로
호스트 페이지에 다른 스타일시트는 필요하지 않습니다. 한국어, 폴란드어, 영어 UI 번역도 **번들에 포함**되어
있어 `i18n` 파일이 필요 없습니다. 아래의 `MAP_CONFIG`를 통해 문자열을 덮어쓰거나 언어를 추가할
수 있습니다. 호스트에서 제공해야 하는 유일한 에셋은 `favicon`입니다.

#### 호스트 설정

페이지는 스크립트 실행 **전에** 설정하는 전역 변수 `window.MAP_CONFIG`를 통해 구성합니다.

```html
<script>
  window.MAP_CONFIG = {
    // 맵 데이터 — 브라우저에서 디코딩되는 .dat 또는 .json 내보내기 파일. 위의 "맵 데이터 소스" 참고.
    mapUrl: "data/map.dat",
    // ...또는 JSON 배열 두 개 사용: mapDataUrl: "data/mapExport.json", colorsUrl: "data/colors.json",

    // 선택 항목 — 기본값이 없습니다. 생략하면 해당 기능이 꺼집니다.
    npcUrl: "...",          // NPC 검색 활성화; 미설정 시 방 ID 검색만 가능
    versionsTagsUrl: "...", // 도움말 모달에 버전 선택기를 표시; 미설정 시 숨김
    versionsFilesUrl: "...",// 선택한 버전의 맵을 가져옴(%tag%가 대체됨)

    // 브랜딩 — 번들에 기본값이 포함되어 있지 않습니다.
    title: { pl: "Mapa Arkadii", en: "Arkadia Map", ko: "아르카디아 지도" }, // 문자열 또는 언어별 맵
    logo: "images/logo.png",                           // 로고 이미지 URL/경로; 생략하면 로고를 표시하지 않음
    credits: {                                          // 도움말 모달 하단 정보; 생략하면 전체 숨김
      author: "Dargoth",
      githubUrl: "https://github.com/Delwing/mudlet-map-reader",
      remark: { pl: "...", en: "...", ko: "..." },       // 문자열 또는 언어별 맵; 인라인 HTML 사용 가능
    },

    // 번역 — 한국어, 폴란드어, 영어가 번들되어 있습니다. 여기서 덮어쓰거나 확장할 수 있습니다.
    translations: { en: { search: "Find" }, de: { search: "Suchen", settings: "Einstellungen" } },
    languages: [{ code: "ko", flag: "kr" }, { code: "pl" }, { code: "en", flag: "gb" }, { code: "de" }], // 언어 선택기 항목 및 국기 스프라이트
  };
</script>
<script src="index.min.js"></script>
```

`title`, `logo`, `credits`에는 **기본값이 없습니다**. 번들은 특정 브랜드에 종속되지 않으며,
이 항목을 생략하면 표시되지 않습니다(헤더 제목은 번들에 포함된 `title` 문자열을 사용합니다).
한국어/폴란드어/영어 문자열은 별도 설정 없이 사용할 수 있습니다. `translations`로 기존 문자열을
수정하거나 언어 전체를 추가하고, `languages`로 언어 선택기를 구성할 수 있습니다. 전체 예제는
`demo/index.html`을 참고하세요.

저장된 언어 선택이 있으면 해당 언어를 우선 사용합니다. 저장된 선택이 없으면 호스트 페이지의
`<html lang="...">`에 지정된 지원 언어를 사용하고, 그것도 없으면 언어 목록의 첫 항목을 사용합니다
(기본 목록은 한국어가 첫 번째입니다). 데모와 배포 페이지는 `<html lang="ko">`로 설정되어 있습니다.
`languages`를 직접 지정하면 기본 목록을 대체하므로, 한국어를 제공하려면
`{ code: "ko", flag: "kr" }`도 포함하세요.

### URL 매개변수

| 매개변수       | 동작                                      |
| -------------- | ----------------------------------------- |
| `?loc=ID`      | 방 `ID`를 화면 중앙에 표시하고 선택합니다. |
| `?area=ID`     | 지역 `ID`를 엽니다.                       |
| `?version=TAG` | 릴리스 `TAG`에 게시된 맵 버전을 불러옵니다. |

## 개발

```bash
yarn install     # 의존성 설치
yarn dev         # 데모 실행(Vite 개발 서버) — 아래 설명 참고
yarn build       # dist/index.min.js 생성(+ 소스 맵)
yarn typecheck   # --noEmit 옵션으로 TypeScript 컴파일러 실행
```

`yarn dev`는 `demo/` 디렉터리(Vite 개발 루트)에서 데모를 제공합니다. `demo/index.html`은
`#root` 마운트 지점, Mudlet `.dat`를 가리키는 `MAP_CONFIG.mapUrl`, 앱으로 구성된 최소 호스트
페이지입니다. 실제 Arkadia `.dat` 파일을 브라우저에서 디코딩하고 실행 중인 배포 사이트에서
favicon을 불러오므로 별도 설정 없이도 프로덕션과 유사한 데이터로 개발할 수 있습니다.
또한 호스트 페이지에서 번들을 연결하는 방법을 보여 주는 예제이기도 합니다(프로덕션에서는 개발
모듈 대신 `<script src="index.min.js">` 태그를 사용한다는 점만 다릅니다).

이 프로젝트는 TypeScript와 React로 작성되었으며 [Vite](https://vite.dev/)로 하나의 압축된
IIFE로 번들됩니다(`vite.config.ts` 참고). React도 번들에 포함되어 있으므로 호스트 페이지에서
CDN 스크립트를 추가할 필요가 없습니다. 주요 소스 모듈은 다음과 같습니다.

- `src/main.tsx` — 번들 진입점으로 React 앱을 `#root`에 마운트합니다.
- `src/MapApp.tsx` — 최상위 컴포넌트로 컨트롤러를 초기화하고 UI를 배치합니다.
- `src/map/MapController.ts` — `mudlet-map-renderer`를 감싸는 프레임워크 독립 컨트롤러입니다.
  지역, 방, 경로, 설정, 렌더링 모드, 이미지 내보내기를 처리하고 React에 상태를 전달합니다.
- `src/components/` — 헤더, 도구 모음, 모달, 정보 상자, 미니맵, 경로, 확대/축소, 토스트 등의 UI입니다.
- `src/i18n/` — 번역 제공자입니다. 한국어/폴란드어/영어 사전이 번들되어 있으며 설정으로 재정의할 수 있습니다.
- `src/preview.ts` — 컨트롤러가 명령형으로 제어하는 미니맵 미리 보기 오버레이입니다.
- `src/data/npc.ts` — NPC 데이터 로딩, `src/versions.ts` — GitHub 릴리스 태그 및 맵 버전 처리입니다.

Bootstrap 모달, 드롭다운, 토스트는 `data-bs-*` 데이터 API를 통해 동작합니다(Bootstrap JS는
부수 효과를 위해 `src/main.tsx`에서 가져옵니다).

## 배포

이 저장소의 GitHub Pages 배포 페이지는 `demo/public/index.html`을 사용하며,
`demo/public/jura/jura2-map.json`의 Jura 지도를 불러옵니다.
지도 JSON은 빌드할 때 `dist/jura/`에 복사됩니다. 로컬 데모의 설정은 별개입니다.

`*.*.*` 태그를 푸시하면 [`Publish to npm`](.github/workflows/publish.yml) GitHub Action이
실행되어 번들을 빌드하고 `npm publish --provenance --access public`를 실행합니다.
배포되는 패키지에는 `dist/` 폴더만 포함됩니다.

## 라이선스

MIT
