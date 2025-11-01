# 📁 프로젝트 구조 문서

## 현재 파일 구조

```
aaa/
├── index.html              # 메인 페이지 (캘린더 + 이벤트 목록)
├── detail.html             # 상세보기 페이지 (Notion 스타일)
├── script.js               # 메인 로직 (1218줄)
├── detail.js               # 상세 페이지 로직 (1616줄)
├── styles.css              # 전체 스타일 (1058줄)
├── assets/                 # 이미지 리소스
│   └── notion_icon.png
├── main.py                 # Flask 백엔드 (사용 안 함)
├── requirements.txt        # Python 의존성
├── calendar_app.db         # SQLite DB (사용 안 함)
├── .gitignore              # Git 제외 파일
├── README.md               # 프로젝트 설명
└── PROJECT_STRUCTURE.md    # 구조 문서 (이 파일)
```

## 기능별 코드 분류

### script.js 주요 기능
1. **캘린더 렌더링** (renderCalendar, createCalendarDay)
2. **이벤트 관리** (loadTodos, saveTodos, addTodo, editTodo, deleteTodo)
3. **링크 관리** (loadSavedLinks, saveSavedLinks, renderSavedLinks)
4. **모달 관리** (openModal, closeModal, setupLinkModal)
5. **운세 기능** (openHoroscopeModal, generateHoroscope, calculateZodiacSign)
6. **UI 렌더링** (renderTodos, createTodoElement, formatTime)

### detail.js 주요 기능
1. **상세 페이지 렌더링** (renderDetailPage)
2. **카드 관리** (createMemoRecordingCard, createPhotosCard, createLinksCard)
3. **드래그 앤 드롭** (makeDraggable, makeResizable, makeCollapsible)
4. **녹음 기능** (startRecording, stopRecording, initSpeechRecognition)
5. **AI 요약** (summarizeText)
6. **사진 관리** (renderPhotos, handlePhotoUpload, deletePhoto)
7. **링크 관리** (renderLinks, deleteLink)

### styles.css 구조
1. **전역 스타일** (body, *, root variables)
2. **레이아웃** (app-container, calendar-section, right-section)
3. **캘린더** (calendar-grid, calendar-day, today, selected)
4. **이벤트** (todo-item, todo-title, todo-actions)
5. **모달** (modal, modal-content, modal-header)
6. **상세 페이지** (draggable-card, card-header, resize-handle)
7. **링크** (link-icon-card, link-icon-circle)
8. **버튼** (btn-submit, btn-cancel, add-event-btn)

## 향후 구조화 계획 (참고용)

### 권장 모듈 구조 (구현 예정)
```
js/
├── app.js                  # 메인 진입점
├── state/
│   └── store.js           # 상태 관리
├── services/
│   └── storage.js         # LocalStorage 서비스
├── components/
│   ├── Calendar.js
│   ├── TodoList.js
│   ├── TodoItem.js
│   ├── LinkCard.js
│   ├── Modal.js
│   └── Horoscope.js
├── pages/
│   ├── main.js
│   └── detail.js
└── utils/
    ├── date.js
    ├── uuid.js
    └── dom.js

css/
├── main.css               # 전역 스타일
├── components/
│   ├── calendar.css
│   ├── modal.css
│   └── todo.css
└── pages/
    ├── index.css
    └── detail.css
```

## Git 커밋 전략 (권장)

1. **초기 설정**: 프로젝트 구조 및 기본 파일
2. **기능별 커밋**:
   - feat: 캘린더 기능 구현
   - feat: 이벤트 CRUD 기능
   - feat: 링크 관리 기능
   - feat: 상세보기 페이지 구현
   - feat: 드래그 앤 드롭 기능
   - feat: 음성 녹음 기능
   - feat: AI 요약 기능
   - feat: 운세 기능
   - style: UI/UX 개선
   - refactor: 코드 리팩토링

## 데이터 흐름

```
사용자 입력
    ↓
이벤트 핸들러 (script.js / detail.js)
    ↓
상태 업데이트 (todos, savedLinks)
    ↓
LocalStorage 저장
    ↓
UI 렌더링 (renderCalendar, renderTodos, etc.)
```

