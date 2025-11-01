# 📤 GitHub 업로드 가이드

## 📋 커밋 단위 구분 가이드

이 파일들을 **기능별로 나눠서** 커밋하세요. 아래 순서대로 진행하면 됩니다.

---

## 1단계: Git 저장소 초기화

```bash
git init
git branch -M main
```

---

## 2단계: 커밋 순서 및 메시지

### 커밋 1: 프로젝트 기본 구조 생성

```bash
git add index.html detail.html styles.css
git commit -m "feat: 프로젝트 기본 HTML 및 CSS 구조 생성

- 메인 페이지 (index.html) 생성
- 상세보기 페이지 (detail.html) 생성  
- 통합 스타일시트 (styles.css) 추가"
```

**파일:**
- `index.html`
- `detail.html`
- `styles.css`

---

### 커밋 2: 캘린더 및 이벤트 관리 기능

```bash
git add script.js
git commit -m "feat: 캘린더 및 이벤트 관리 기능 구현

- 월별 캘린더 렌더링
- 날짜 선택 및 이벤트 표시
- 이벤트 추가/수정/삭제 기능
- 이전/다음 월 네비게이션
- LocalStorage를 활용한 데이터 저장"
```

**파일:**
- `script.js`

---

### 커밋 3: 상세보기 페이지 기능

```bash
git add detail.js
git commit -m "feat: 상세보기 페이지 기능 구현

- 드래그 가능한 카드 레이아웃
- 메모 및 녹음 통합 카드
- 사진 업로드 및 관리
- 링크 관리 카드
- 카드 리사이즈 및 확장/축소 기능
- 레이아웃 자동 저장"
```

**파일:**
- `detail.js`

---

### 커밋 4: 음성 녹음 및 AI 요약 기능

```bash
git add script.js detail.js
git commit -m "feat: 음성 녹음 및 AI 요약 기능

- Web Speech API를 활용한 음성 인식
- MediaRecorder API를 활용한 오디오 녹음
- Google Gemini API 통합
- 여러 모델 fallback 지원
- 전사 텍스트 및 AI 요약 표시"
```

**주의:** `script.js`와 `detail.js`에 녹음/AI 기능이 모두 들어있다면 위처럼 같이 커밋합니다.  
만약 이미 이전 커밋에 포함되어 있다면 이 단계는 생략하세요.

---

### 커밋 5: 링크 관리 기능

```bash
git add script.js detail.js
git commit -m "feat: 링크 저장소 및 관리 기능

- 링크 추가/삭제 기능
- 아이콘 선택 기능 (GitHub, Notion, 카카오톡 등)
- 링크 그리드 뷰
- 이벤트에 링크 연결 기능
- 메인 페이지와 상세 페이지 링크 동기화"
```

**주의:** 링크 기능이 `script.js`에만 있다면:
```bash
git add script.js
git commit -m "feat: 링크 저장소 및 관리 기능

- 링크 추가/삭제 기능
- 아이콘 선택 기능
- 링크 그리드 뷰
- 이벤트에 링크 연결 기능"
```

---

### 커밋 6: 운세 확인 기능

```bash
git add index.html script.js
git commit -m "feat: 일일 운세 확인 기능

- 생년월일 및 별자리 입력 모달
- 운세 점수 계산 알고리즘
- 운세 상세 설명 생성
- 운세 결과 표시 모달"
```

**파일:**
- `index.html` (운세 모달 HTML)
- `script.js` (운세 관련 함수)

---

### 커밋 7: UI/UX 개선

```bash
git add styles.css
git commit -m "style: 모달 및 버튼 UI 개선

- 그라데이션 버튼 스타일
- 모달 애니메이션 효과
- 호버 효과 개선
- 반응형 디자인 개선
- 드래그 앤 드롭 스타일 최적화"
```

**파일:**
- `styles.css`

---

### 커밋 8: 프로젝트 문서화

```bash
git add README.md PROJECT_STRUCTURE.md GIT_COMMIT_GUIDE.md CONTRIBUTING.md
git commit -m "docs: 프로젝트 문서화

- README.md 작성 (프로젝트 소개, 기능, 실행 방법, 기술스택)
- 프로젝트 구조 문서 추가
- Git 커밋 가이드 작성
- 기여 가이드 작성"
```

**파일:**
- `README.md`
- `PROJECT_STRUCTURE.md`
- `GIT_COMMIT_GUIDE.md`
- `CONTRIBUTING.md`

---

### 커밋 9: Git 설정 파일

```bash
git add .gitignore
git commit -m "chore: Git 설정 파일 추가

- .gitignore 파일 추가
- 불필요한 파일 제외 설정"
```

**파일:**
- `.gitignore`

---

### 커밋 10: 리소스 파일 (있는 경우)

```bash
git add assets/
git commit -m "chore: 이미지 리소스 추가

- Notion 아이콘 이미지 추가"
```

**파일:**
- `assets/` 폴더 내 모든 파일

---

## 3단계: GitHub에 푸시

```bash
# 원격 저장소 추가 (GitHub에서 생성한 저장소 URL)
git remote add origin https://github.com/your-username/simple-todo-calendar.git

# 모든 커밋을 GitHub에 푸시
git push -u origin main
```

---

## 📝 전체 커밋 예시 (한 번에)

만약 더 간단하게 나누고 싶다면:

### 방법 A: 기능별로 3개 커밋

```bash
# 커밋 1: 기본 구조
git add index.html detail.html styles.css .gitignore
git commit -m "feat: 프로젝트 기본 구조 생성

- HTML 파일 생성 (메인 페이지, 상세보기 페이지)
- 통합 스타일시트 추가
- Git 설정 파일 추가"

# 커밋 2: 주요 기능
git add script.js detail.js
git commit -m "feat: 캘린더 및 일정 관리 기능 구현

- 캘린더 뷰 및 이벤트 CRUD 기능
- 상세보기 페이지 (드래그 가능한 카드)
- 링크 저장소 기능
- 음성 녹음 및 AI 요약 기능
- 운세 확인 기능"

# 커밋 3: 문서화
git add README.md PROJECT_STRUCTURE.md GIT_COMMIT_GUIDE.md CONTRIBUTING.md assets/
git commit -m "docs: 프로젝트 문서화 및 리소스 추가

- README.md 작성
- 프로젝트 구조 문서
- Git 커밋 가이드
- 이미지 리소스 추가"
```

### 방법 B: 더 세분화 (5개 커밋)

```bash
# 커밋 1: HTML 구조
git add index.html detail.html
git commit -m "feat: HTML 페이지 구조 생성"

# 커밋 2: 스타일
git add styles.css
git commit -m "style: CSS 스타일시트 추가"

# 커밋 3: 메인 기능
git add script.js
git commit -m "feat: 캘린더 및 이벤트 관리 기능"

# 커밋 4: 상세보기 기능
git add detail.js
git commit -m "feat: 상세보기 페이지 기능"

# 커밋 5: 문서 및 설정
git add README.md PROJECT_STRUCTURE.md GIT_COMMIT_GUIDE.md CONTRIBUTING.md .gitignore assets/
git commit -m "docs: 프로젝트 문서화 완료"
```

---

## ⚠️ 주의사항

1. **이미 커밋한 파일을 다시 추가하지 마세요**
   - 같은 파일을 여러 커밋에 포함하면 안 됩니다
   - 파일이 여러 커밋에 걸쳐 수정되었다면, 마지막 커밋에만 포함하세요

2. **커밋 순서는 중요하지 않습니다**
   - 위 순서는 참고용입니다
   - 기능 단위로 논리적으로 나누면 됩니다

3. **최소 3개 이상의 커밋 권장**
   - "Git 커밋 단위 구분" 요구사항을 만족하려면 최소 3개 이상 커밋

4. **의미 있는 메시지 작성**
   - `type: subject` 형식 사용
   - 본문에 변경 내용 요약

---

## ✅ 체크리스트

제출 전 확인:

- [ ] Git 저장소 초기화 완료
- [ ] 최소 3개 이상의 커밋 생성
- [ ] 각 커밋이 의미 있는 단위로 구분됨
- [ ] 커밋 메시지가 명확하고 설명적임
- [ ] 모든 파일이 커밋에 포함됨
- [ ] GitHub에 푸시 완료
- [ ] 저장소가 Public으로 설정됨
- [ ] README.md가 제대로 표시됨

---

## 🚀 빠른 실행 명령어 (복사해서 사용)

```bash
# 1. Git 초기화
git init
git branch -M main

# 2. 기본 구조
git add index.html detail.html styles.css .gitignore
git commit -m "feat: 프로젝트 기본 구조 생성"

# 3. 메인 기능
git add script.js
git commit -m "feat: 캘린더 및 이벤트 관리 기능 구현"

# 4. 상세보기 기능
git add detail.js
git commit -m "feat: 상세보기 페이지 기능 구현"

# 5. 문서화
git add README.md PROJECT_STRUCTURE.md GIT_COMMIT_GUIDE.md CONTRIBUTING.md assets/
git commit -m "docs: 프로젝트 문서화 완료"

# 6. GitHub 연결 및 푸시
git remote add origin https://github.com/your-username/simple-todo-calendar.git
git push -u origin main
```

**주의:** `your-username`과 `simple-todo-calendar`를 실제 값으로 변경하세요!

