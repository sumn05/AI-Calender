// LocalStorage 키
const STORAGE_KEY = 'simple-todos';

// URL에서 todo ID 가져오기
const urlParams = new URLSearchParams(window.location.search);
const todoId = urlParams.get('id');

let todos = [];
let currentTodo = null;

// DOM 요소
const detailPageTitle = document.getElementById('detailPageTitle');
const detailPageTodoId = document.getElementById('detailPageTodoId');
const detailPageSaveBtn = document.getElementById('detailPageSaveBtn');
const canvasArea = document.getElementById('canvasArea');

// 동적으로 생성되는 요소들 (초기에는 null)
let detailPageNote = null;
let detailPagePhotosContainer = null;
let detailPagePhotoUpload = null;
let detailPageAddPhotoBtn = null;
let detailPageLinksContainer = null;
let recordBtn = null;
let stopRecordBtn = null;
let summarizeBtn = null;
let recordingStatus = null;
let recordingTime = null;
let transcriptionArea = null;
let transcriptionText = null;
let insertTranscriptionBtn = null;

// 녹음 관련 변수
let mediaRecorder = null;
let audioChunks = [];
let recordingStream = null;
let recognition = null;
let isRecording = false;
let recordingStartTime = null;
let recordingTimer = null;
let transcribedText = '';

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    
    if (!todoId) {
        alert('이벤트를 찾을 수 없습니다.');
        window.location.href = 'index.html';
        return;
    }

    const todoIndex = todos.findIndex(t => t.id === todoId);
    if (todoIndex === -1) {
        alert('이벤트를 찾을 수 없습니다.');
        window.location.href = 'index.html';
        return;
    }
    
    // 참조를 유지하기 위해 인덱스로 접근
    currentTodo = todos[todoIndex];
    
    // 링크 데이터 확인 및 디버깅
    console.log('로드된 currentTodo:', currentTodo);
    console.log('currentTodo.links:', currentTodo.links);
    
    // 링크 필드가 없거나 null이면 빈 배열로 초기화
    if (!currentTodo.hasOwnProperty('links') || currentTodo.links === null || currentTodo.links === undefined) {
        currentTodo.links = [];
    }

    // API 키 자동 설정 (저장된 키가 없을 경우)
    initializeApiKey();

    renderDetailPage();
    setupEventListeners();
    
    // 페이지 포커스 시 최신 링크 데이터 다시 로드
    window.addEventListener('focus', () => {
        loadTodos();
        const todoIndex = todos.findIndex(t => t.id === todoId);
        if (todoIndex !== -1 && currentTodo) {
            const latestTodo = todos[todoIndex];
            if (latestTodo.links && JSON.stringify(latestTodo.links) !== JSON.stringify(currentTodo.links || [])) {
                currentTodo.links = latestTodo.links;
                if (detailPageLinksContainer) {
                    renderLinks(currentTodo.links || []);
                }
            }
        }
    });
    
    // 주기적으로 스토리지 변경 확인 (같은 탭에서의 변경 감지)
    setInterval(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const newTodos = JSON.parse(stored);
                // 현재 todo의 링크가 변경되었는지 확인
                if (currentTodo && currentTodo.id) {
                    const updatedTodo = newTodos.find(t => t.id === currentTodo.id);
                    if (updatedTodo) {
                        // 링크 변경 확인
                        const currentLinks = JSON.stringify(currentTodo.links || []);
                        const newLinks = JSON.stringify(updatedTodo.links || []);
                        if (currentLinks !== newLinks || !currentTodo.links) {
                            // 전체 todo 객체 업데이트 (링크 외 다른 필드도 동기화)
                            Object.assign(currentTodo, updatedTodo);
                            todos = newTodos;
                            // 링크 카드가 있으면 링크만 다시 렌더링
                            if (detailPageLinksContainer) {
                                renderLinks(currentTodo.links || []);
                            }
                        }
                    }
                }
            } catch (error) {
                // 무시
            }
        }
    }, 500); // 0.5초마다 확인 (더 빠른 동기화)
});

// 이벤트 리스너 설정
function setupEventListeners() {
    detailPageSaveBtn.addEventListener('click', saveDetailPage);
    
    // Web Speech API 초기화
    initSpeechRecognition();
    
    // 드래그 앤 드롭 초기화
    initDragAndDrop();
}

// API 키 초기화 (저장된 키가 없을 경우 기본 키 설정 - Gemini)
function initializeApiKey() {
    const savedKey = localStorage.getItem('gemini_api_key');
    
    // 키가 없거나 너무 짧으면 기본 키로 설정
    if (!savedKey || savedKey.trim().length < 30) {
        const defaultApiKey = 'AIzaSyBtJisIdyUUlKdAQTjjnzzjrgQMiyiQI-A';
        localStorage.setItem('gemini_api_key', defaultApiKey.trim());
        console.log('Gemini API 키가 자동으로 설정되었습니다.');
    } else {
        // 기존 키에 공백이 있으면 제거
        const trimmedKey = savedKey.trim();
        if (trimmedKey !== savedKey) {
            localStorage.setItem('gemini_api_key', trimmedKey);
            console.log('API 키의 공백이 제거되었습니다.');
        }
    }
}

// LocalStorage에서 데이터 로드
function loadTodos() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            todos = JSON.parse(stored);
        } catch (e) {
            console.error('데이터 로드 오류:', e);
            todos = [];
        }
    } else {
        todos = [];
    }
}

// 스토리지 변경 감지하여 데이터 동기화
window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
        try {
            const newTodos = JSON.parse(e.newValue);
            todos = newTodos;
            
            // 현재 todo 업데이트
            if (currentTodo && currentTodo.id) {
                const updatedTodo = todos.find(t => t.id === currentTodo.id);
                if (updatedTodo) {
                    currentTodo = updatedTodo;
                    // 링크가 변경되었으면 다시 렌더링
                    if (detailPageLinksContainer) {
                        renderLinks(currentTodo.links || []);
                    }
                }
            }
        } catch (error) {
            console.error('스토리지 동기화 오류:', error);
        }
    }
});

// LocalStorage에 데이터 저장
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 상세 페이지 렌더링 (드래그 가능한 카드 방식)
function renderDetailPage() {
    if (!currentTodo) return;

    // 최신 데이터 다시 로드 (메인 페이지에서 추가한 링크 포함)
    loadTodos();
    const todoIndex = todos.findIndex(t => t.id === currentTodo.id);
    if (todoIndex !== -1) {
        const latestTodo = todos[todoIndex];
        // 링크를 포함한 모든 데이터 업데이트
        if (latestTodo.links !== undefined) {
            currentTodo.links = latestTodo.links || [];
        }
        console.log('[renderDetailPage] 최신 링크 로드:', currentTodo.links);
    }

    if (detailPageTodoId) {
        detailPageTodoId.textContent = `ID: ${currentTodo.id}`;
    }
    detailPageTitle.value = currentTodo.title || '';

    // 링크 데이터 확인 및 초기화
    if (!currentTodo.links || !Array.isArray(currentTodo.links)) {
        currentTodo.links = [];
    }

    // 캔버스 초기화
    canvasArea.innerHTML = '';

    // 저장된 레이아웃이 있으면 사용, 없으면 기본 위치 사용
    const layout = currentTodo.layout || {};

    // 저장된 레이아웃 또는 기본 위치로 카드 생성 (초기 배치: 작은 크기로 시작)
    createMemoRecordingCard(layout.memoRecordingCard || { left: 50, top: 50, width: 350, height: 250, collapsed: false });
    createPhotosCard(layout.photosCard || { left: 420, top: 50, width: 350, height: 250, collapsed: false });
    createLinksCard(layout.linksCard || { left: 790, top: 50, width: 350, height: 250, collapsed: false });
}

// 메모 + 녹음 카드 생성 (합쳐진 카드)
function createMemoRecordingCard(position) {
    const card = document.createElement('div');
    card.className = 'draggable-card';
    if (position.collapsed) {
        card.classList.add('collapsed');
    }
    card.id = 'memoRecordingCard';
    card.style.left = position.left + 'px';
    card.style.top = position.top + 'px';
    card.dataset.cardType = 'memoRecording';

    const currentNote = currentTodo.note || '';
    
    // 저장된 크기 정보 적용 (저장된 크기가 있으면 사용, 없으면 기본값)
    if (position.width) {
        card.style.width = position.width + 'px';
    } else {
        card.style.width = '350px'; // 기본값
    }
    if (position.height) {
        card.style.height = position.height + 'px';
    } else {
        card.style.height = '250px'; // 기본값
    }
    
    card.innerHTML = `
        <div class="card-header">
            <h3>메모 & 녹음</h3>
            <div class="card-header-actions">
                <button type="button" class="card-toggle-btn" title="확장/축소">
                    <span class="toggle-icon">▼</span>
                </button>
                <div class="drag-handle">⋮⋮</div>
            </div>
        </div>
        <div class="card-content">
            <div style="margin-bottom: 16px;">
                <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                    <button type="button" id="recordBtn" class="record-btn">
                        <span id="recordIcon">🎤</span>
                        <span id="recordText">녹음 시작</span>
                    </button>
                    <button type="button" id="stopRecordBtn" class="record-btn stop-btn" style="display: none;">
                        <span>⏹</span>
                        <span>녹음 중지</span>
                    </button>
                    <button type="button" id="summarizeBtn" class="summarize-btn" style="display: none;">
                        <span>🤖</span>
                        <span>AI 요약</span>
                    </button>
                </div>
                <div id="recordingStatus" style="display: none; margin-bottom: 12px; padding: 12px; background: #fff3cd; border-radius: 8px; color: #856404;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="recording-indicator"></span>
                        <span id="recordingTime">00:00</span>
                        <span>녹음 중...</span>
                    </div>
                </div>
                <div id="transcriptionArea" style="display: none; margin-bottom: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e0e0e0;">
                    <div style="font-weight: 600; margin-bottom: 8px; color: #666;">음성 인식 결과:</div>
                    <div id="transcriptionText" style="color: #333; line-height: 1.6;"></div>
                    <button type="button" id="insertTranscriptionBtn" class="insert-btn" style="margin-top: 8px;">메모에 추가</button>
                </div>
            </div>
            <textarea id="detailPageNote" class="detail-page-note" placeholder="상세 내용을 입력하세요..." style="flex: 1; min-height: 100px; width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1em; font-family: inherit; resize: none; box-sizing: border-box;">${escapeHtml(currentNote)}</textarea>
        </div>
        <div class="resize-handle top-left"></div>
        <div class="resize-handle top-right"></div>
        <div class="resize-handle bottom-left"></div>
        <div class="resize-handle bottom-right"></div>
    `;

    canvasArea.appendChild(card);
    makeDraggable(card);
    makeCollapsible(card);
    makeResizable(card);
    
    // textarea 참조 업데이트
    const noteTextarea = card.querySelector('#detailPageNote');
    if (noteTextarea) {
        detailPageNote = noteTextarea;
    }
    
    // 녹음 관련 이벤트 리스너 설정
    const newRecordBtn = card.querySelector('#recordBtn');
    const newStopBtn = card.querySelector('#stopRecordBtn');
    const newSummarizeBtn = card.querySelector('#summarizeBtn');
    const newInsertBtn = card.querySelector('#insertTranscriptionBtn');
    const newStatus = card.querySelector('#recordingStatus');
    const newTime = card.querySelector('#recordingTime');
    const newArea = card.querySelector('#transcriptionArea');
    const newText = card.querySelector('#transcriptionText');
    
    if (newRecordBtn) {
        newRecordBtn.addEventListener('click', startRecording);
        recordBtn = newRecordBtn;
    }
    if (newStopBtn) {
        newStopBtn.addEventListener('click', stopRecording);
        stopRecordBtn = newStopBtn;
    }
    if (newSummarizeBtn) {
        newSummarizeBtn.addEventListener('click', summarizeText);
        summarizeBtn = newSummarizeBtn;
    }
    if (newInsertBtn) {
        newInsertBtn.addEventListener('click', insertTranscription);
        insertTranscriptionBtn = newInsertBtn;
    }
    
    // 전역 참조 업데이트
    recordingStatus = newStatus;
    recordingTime = newTime;
    transcriptionArea = newArea;
    transcriptionText = newText;
}


// 사진 카드 생성
function createPhotosCard(position) {
    const card = document.createElement('div');
    card.className = 'draggable-card';
    if (position.collapsed) {
        card.classList.add('collapsed');
    }
    card.id = 'photosCard';
    card.style.left = position.left + 'px';
    card.style.top = position.top + 'px';
    card.dataset.cardType = 'photos';

    // 저장된 크기 정보 적용 (저장된 크기가 있으면 사용, 없으면 기본값)
    if (position.width) {
        card.style.width = position.width + 'px';
    } else {
        card.style.width = '350px'; // 기본값
    }
    if (position.height) {
        card.style.height = position.height + 'px';
    } else {
        card.style.height = '250px'; // 기본값
    }
    
    card.innerHTML = `
        <div class="card-header">
            <h3>사진</h3>
            <div class="card-header-actions">
                <button type="button" class="card-toggle-btn" title="확장/축소">
                    <span class="toggle-icon">▼</span>
                </button>
                <div class="drag-handle">⋮⋮</div>
            </div>
        </div>
        <div class="card-content">
            <div class="photos-container" id="detailPagePhotosContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px; margin-bottom: 12px; min-height: 50px;">
                <!-- 사진들이 여기에 동적으로 추가됩니다 -->
            </div>
            <input type="file" id="detailPagePhotoUpload" accept="image/*" multiple style="display: none;" />
            <button type="button" class="add-photo-btn" id="detailPageAddPhotoBtn" style="width: 100%; padding: 12px; background: #f0f0f0; border: 2px dashed #ccc; border-radius: 8px; cursor: pointer;">
                📷 사진 추가
            </button>
        </div>
        <div class="resize-handle top-left"></div>
        <div class="resize-handle top-right"></div>
        <div class="resize-handle bottom-left"></div>
        <div class="resize-handle bottom-right"></div>
    `;

    canvasArea.appendChild(card);
    makeDraggable(card);
    makeCollapsible(card);
    makeResizable(card);
    
    // 사진 렌더링
    renderPhotos(currentTodo.photos || []);
    
    // 이벤트 리스너 재설정
    const newAddBtn = card.querySelector('#detailPageAddPhotoBtn');
    const newUpload = card.querySelector('#detailPagePhotoUpload');
    const newContainer = card.querySelector('#detailPagePhotosContainer');
    
    if (newAddBtn) {
        newAddBtn.addEventListener('click', () => newUpload.click());
        detailPageAddPhotoBtn = newAddBtn;
    }
    if (newUpload) {
        newUpload.addEventListener('change', handlePhotoUpload);
        detailPagePhotoUpload = newUpload;
    }
    if (newContainer) {
        detailPagePhotosContainer = newContainer;
    }
}

// 링크 카드 생성
function createLinksCard(position) {
    const card = document.createElement('div');
    card.className = 'draggable-card';
    if (position.collapsed) {
        card.classList.add('collapsed');
    }
    card.id = 'linksCard';
    card.style.left = position.left + 'px';
    card.style.top = position.top + 'px';
    card.dataset.cardType = 'links';

    // 저장된 크기 정보 적용 (저장된 크기가 있으면 사용, 없으면 기본값)
    if (position.width) {
        card.style.width = position.width + 'px';
    } else {
        card.style.width = '350px'; // 기본값
    }
    if (position.height) {
        card.style.height = position.height + 'px';
    } else {
        card.style.height = '250px'; // 기본값
    }
    
    card.innerHTML = `
        <div class="card-header">
            <h3>링크</h3>
            <div class="card-header-actions">
                <button type="button" class="card-toggle-btn" title="확장/축소">
                    <span class="toggle-icon">▼</span>
                </button>
                <div class="drag-handle">⋮⋮</div>
            </div>
        </div>
        <div class="card-content">
            <div id="detailPageLinksContainer">
                <!-- 링크들이 여기에 표시됩니다 -->
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0;">
                <input type="text" id="detailPageLinkName" placeholder="링크 이름" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;" />
                <input type="url" id="detailPageLinkUrl" placeholder="https://example.com" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;" />
                <button type="button" id="detailPageAddLinkBtn" style="width: 100%; padding: 10px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                    ➕ 링크 추가
                </button>
            </div>
        </div>
        <div class="resize-handle top-left"></div>
        <div class="resize-handle top-right"></div>
        <div class="resize-handle bottom-left"></div>
        <div class="resize-handle bottom-right"></div>
    `;

    canvasArea.appendChild(card);
    makeDraggable(card);
    makeCollapsible(card);
    makeResizable(card);
    
    const newLinksContainer = card.querySelector('#detailPageLinksContainer');
    const addLinkBtn = card.querySelector('#detailPageAddLinkBtn');
    const linkNameInput = card.querySelector('#detailPageLinkName');
    const linkUrlInput = card.querySelector('#detailPageLinkUrl');
    
    if (newLinksContainer) {
        detailPageLinksContainer = newLinksContainer;
        
        console.log('[createLinksCard] 링크 컨테이너 설정 완료');
        
        // 최신 데이터 다시 로드 (메인 페이지에서 추가한 링크 포함)
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const latestTodos = JSON.parse(stored);
                const latestTodo = latestTodos.find(t => t.id === currentTodo.id);
                if (latestTodo) {
                    console.log('[createLinksCard] 최신 todo 찾음:', latestTodo);
                    console.log('[createLinksCard] 최신 todo.links:', latestTodo.links);
                    // 링크 데이터 업데이트 (배열인 경우만)
                    if (Array.isArray(latestTodo.links)) {
                        currentTodo.links = latestTodo.links;
                        console.log('[createLinksCard] 링크 업데이트 완료:', currentTodo.links);
                    } else if (latestTodo.links === undefined || latestTodo.links === null) {
                        currentTodo.links = [];
                        console.log('[createLinksCard] 링크가 없어서 빈 배열 설정');
                    }
                } else {
                    console.warn('[createLinksCard] 최신 todo를 찾을 수 없음');
                }
            } catch (e) {
                console.error('[createLinksCard] 링크 데이터 로드 오류:', e);
            }
        } else {
            console.warn('[createLinksCard] LocalStorage에 데이터가 없음');
        }
        
        // 링크 렌더링 (컨테이너가 설정된 후에)
        console.log('[createLinksCard] 렌더링할 링크:', currentTodo.links);
        setTimeout(() => {
            renderLinks(currentTodo.links || []);
        }, 50);
    } else {
        console.error('[createLinksCard] 링크 컨테이너를 찾을 수 없음!');
    }
    
    // 링크 추가 버튼 이벤트
    if (addLinkBtn) {
        addLinkBtn.addEventListener('click', () => {
            const name = linkNameInput.value.trim();
            const url = linkUrlInput.value.trim();
            
            if (!url) {
                alert('URL을 입력해주세요.');
                return;
            }
            
            if (!currentTodo.links) {
                currentTodo.links = [];
            }
            
            const newLink = {
                name: name || '링크',
                url: url,
                iconEmoji: '🔗'
            };
            
            currentTodo.links.push(newLink);
            renderLinks(currentTodo.links);
            
            // 입력 필드 초기화
            linkNameInput.value = '';
            linkUrlInput.value = '';
            
            // 저장
            saveDetailPageWithoutAlert();
        });
    }
    
    // Enter 키로도 링크 추가 가능
    if (linkUrlInput) {
        linkUrlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (addLinkBtn) {
                    addLinkBtn.click();
                }
            }
        });
    }
}

// 확장/축소 기능 추가
function makeCollapsible(element) {
    const toggleBtn = element.querySelector('.card-toggle-btn');
    const toggleIcon = element.querySelector('.toggle-icon');
    
    if (!toggleBtn || !toggleIcon) return;
    
    // 초기 상태 설정
    if (element.classList.contains('collapsed')) {
        toggleIcon.textContent = '▶';
    }
    
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        element.classList.toggle('collapsed');
        toggleIcon.textContent = element.classList.contains('collapsed') ? '▶' : '▼';
        saveCardState(element);
    });
}

// 카드 상태 저장 (확장/축소, 위치, 크기 포함)
function saveCardState(card) {
    if (!currentTodo) return;
    
    const rect = card.getBoundingClientRect();
    const canvasRect = canvasArea.getBoundingClientRect();
    
    const state = {
        left: rect.left - canvasRect.left + canvasArea.scrollLeft,
        top: rect.top - canvasRect.top + canvasArea.scrollTop,
        width: card.offsetWidth,
        height: card.offsetHeight,
        collapsed: card.classList.contains('collapsed')
    };
    
    const cardType = card.dataset.cardType;
    if (cardType) {
        if (!currentTodo.layout) {
            currentTodo.layout = {};
        }
        currentTodo.layout[cardType + 'Card'] = state;
        
        // todos 배열에서도 업데이트하여 저장된 크기가 유지되도록 함
        const todoIndex = todos.findIndex(t => t.id === currentTodo.id);
        if (todoIndex !== -1) {
            if (!todos[todoIndex].layout) {
                todos[todoIndex].layout = {};
            }
            todos[todoIndex].layout[cardType + 'Card'] = state;
            saveTodos();
        }
    }
}

// 리사이즈 기능 추가 (4개 모서리 모두 지원)
function makeResizable(element) {
    const resizeHandles = element.querySelectorAll('.resize-handle');
    if (!resizeHandles || resizeHandles.length === 0) return;
    
    resizeHandles.forEach(handle => {
        let isResizing = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop;
        
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = element.offsetWidth;
            startHeight = element.offsetHeight;
            
            // canvasArea 기준으로 위치 계산
            const rect = element.getBoundingClientRect();
            const canvasRect = canvasArea.getBoundingClientRect();
            startLeft = rect.left - canvasRect.left + canvasArea.scrollLeft;
            startTop = rect.top - canvasRect.top + canvasArea.scrollTop;
            
            handle.classList.add('resizing');
            
            // 커서 스타일 설정
            if (handle.classList.contains('top-left')) {
                element.style.cursor = 'nwse-resize';
            } else if (handle.classList.contains('top-right')) {
                element.style.cursor = 'nesw-resize';
            } else if (handle.classList.contains('bottom-left')) {
                element.style.cursor = 'nesw-resize';
            } else if (handle.classList.contains('bottom-right')) {
                element.style.cursor = 'nwse-resize';
            }
            
            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);
        });
        
        function handleResize(e) {
            if (!isResizing) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const handleClass = handle.classList;
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newTop = startTop;
            
            if (handleClass.contains('bottom-right')) {
                // 오른쪽 아래: 너비와 높이만 변경
                newWidth = Math.max(300, startWidth + deltaX);
                newHeight = Math.max(200, startHeight + deltaY);
            } else if (handleClass.contains('bottom-left')) {
                // 왼쪽 아래: 높이와 왼쪽 위치 변경
                newWidth = Math.max(300, startWidth - deltaX);
                newHeight = Math.max(200, startHeight + deltaY);
                newLeft = startLeft + deltaX;
            } else if (handleClass.contains('top-right')) {
                // 오른쪽 위: 너비와 위쪽 위치 변경
                newWidth = Math.max(300, startWidth + deltaX);
                newHeight = Math.max(200, startHeight - deltaY);
                newTop = startTop + deltaY;
            } else if (handleClass.contains('top-left')) {
                // 왼쪽 위: 모든 방향 변경
                newWidth = Math.max(300, startWidth - deltaX);
                newHeight = Math.max(200, startHeight - deltaY);
                newLeft = startLeft + deltaX;
                newTop = startTop + deltaY;
            }
            
            // 크기 변경
            element.style.width = newWidth + 'px';
            element.style.height = newHeight + 'px';
            
            // 위치가 변경되는 경우
            if (handleClass.contains('top-left') || handleClass.contains('top-right')) {
                element.style.top = newTop + 'px';
            }
            if (handleClass.contains('top-left') || handleClass.contains('bottom-left')) {
                element.style.left = newLeft + 'px';
            }
        }
        
        function stopResize() {
            if (isResizing) {
                isResizing = false;
                handle.classList.remove('resizing');
                element.style.cursor = '';
                saveCardState(element);
            }
            
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
        }
    });
}

// 드래그 앤 드롭 기능 초기화
function makeDraggable(element) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    
    // 현재 위치에서 offset 계산
    const rect = element.getBoundingClientRect();
    const canvasRect = canvasArea.getBoundingClientRect();
    let xOffset = rect.left - canvasRect.left + canvasArea.scrollLeft;
    let yOffset = rect.top - canvasRect.top + canvasArea.scrollTop;

    const dragStart = (e) => {
        // 리사이즈 핸들 클릭 시 드래그 방지
        if (e.target.closest('.resize-handle')) {
            return;
        }
        
        // 텍스트 입력, 버튼 클릭 시 드래그 방지
        if (e.target.tagName === 'TEXTAREA' || 
            e.target.tagName === 'INPUT' || 
            e.target.tagName === 'BUTTON' || 
            e.target.closest('button') ||
            e.target.closest('a') ||
            e.target.closest('img')) {
            return;
        }
        
        // 카드 헤더나 드래그 핸들을 클릭했을 때만 드래그 시작
        if (e.target === element || 
            e.target.closest('.card-header') || 
            e.target.closest('.drag-handle') ||
            e.target === element.querySelector('.card-header') ||
            e.target === element.querySelector('.drag-handle')) {
            
            const rect = element.getBoundingClientRect();
            const canvasRect = canvasArea.getBoundingClientRect();
            xOffset = rect.left - canvasRect.left + canvasArea.scrollLeft;
            yOffset = rect.top - canvasRect.top + canvasArea.scrollTop;
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
            isDragging = true;
            element.classList.add('dragging');
            e.preventDefault();
        }
    };

    const drag = (e) => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            // 캔버스 범위 내에서만 이동하도록 제한
            const maxX = canvasArea.scrollWidth - element.offsetWidth;
            const maxY = canvasArea.scrollHeight - element.offsetHeight;
            
            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));

            setTranslate(currentX, currentY, element);
        }
    };

    const dragEnd = () => {
        if (isDragging) {
            isDragging = false;
            element.classList.remove('dragging');
            
            // 위치 저장
            saveCardPosition(element);
        }
    };

    element.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
}

function setTranslate(xPos, yPos, el) {
    el.style.left = xPos + 'px';
    el.style.top = yPos + 'px';
}

// 카드 위치 저장
function saveCardPosition(card) {
    saveCardState(card);
}

// 드래그 앤 드롭 초기화 함수
function initDragAndDrop() {
    // 카드들이 생성된 후 자동으로 makeDraggable이 호출됨
}

// 시간 포맷팅 (HH:mm -> 12시간 형식)
function formatTime(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHours = h % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
}

// 사진 렌더링
function renderPhotos(photos) {
    if (!detailPagePhotosContainer) return;
    
    detailPagePhotosContainer.innerHTML = '';
    
    if (photos.length === 0) {
        return;
    }

    photos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.style.position = 'relative';
        photoItem.style.aspectRatio = '1';
        photoItem.style.borderRadius = '8px';
        photoItem.style.overflow = 'hidden';
        photoItem.style.border = '2px solid #e0e0e0';
        photoItem.innerHTML = `
            <img src="${photo}" alt="사진 ${index + 1}" class="photo-preview" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
            <button class="photo-delete-btn" onclick="deletePhoto(${index})" title="삭제" style="position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; border-radius: 50%; background: rgba(231, 76, 60, 0.9); color: white; border: none; cursor: pointer; font-size: 1em; display: flex; align-items: center; justify-content: center; transition: all 0.2s; opacity: 0;">×</button>
        `;
        photoItem.addEventListener('mouseenter', () => {
            photoItem.querySelector('.photo-delete-btn').style.opacity = '1';
        });
        photoItem.addEventListener('mouseleave', () => {
            photoItem.querySelector('.photo-delete-btn').style.opacity = '0';
        });
        detailPagePhotosContainer.appendChild(photoItem);
    });
}

// 사진 삭제
function deletePhoto(index) {
    if (!currentTodo) return;

    if (!currentTodo.photos) currentTodo.photos = [];
    currentTodo.photos.splice(index, 1);
    
    renderPhotos(currentTodo.photos);
    saveTodos();
}

// 사진 업로드 처리
function handlePhotoUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!currentTodo) return;

    if (!currentTodo.photos) currentTodo.photos = [];

    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                currentTodo.photos.push(event.target.result);
                renderPhotos(currentTodo.photos);
                saveTodos();
            };
            reader.readAsDataURL(file);
        }
    });

    // 파일 입력 초기화
    e.target.value = '';
}

// 링크 렌더링
function renderLinks(links) {
    console.log('[renderLinks] 호출됨, links:', links);
    console.log('[renderLinks] detailPageLinksContainer:', detailPageLinksContainer);
    
    if (!detailPageLinksContainer) {
        console.warn('[renderLinks] detailPageLinksContainer가 null입니다! 링크를 표시할 수 없습니다.');
        return;
    }
    
    detailPageLinksContainer.innerHTML = '';

    if (!links || links.length === 0) {
        console.log('[renderLinks] 링크가 없어서 빈 메시지 표시');
        detailPageLinksContainer.innerHTML = '<div style="color: #999; padding: 10px; text-align: center;">링크가 없습니다.</div>';
        return;
    }
    
    console.log(`[renderLinks] ${links.length}개의 링크 렌더링 시작`);

    links.forEach((link, index) => {
        const linkItem = document.createElement('div');
        linkItem.className = 'detail-link-item';
        linkItem.style.marginBottom = '8px';
        linkItem.style.position = 'relative';
        
        if (typeof link === 'string') {
            linkItem.innerHTML = `
                <a href="${link}" target="_blank" rel="noopener noreferrer" class="detail-link" style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #f5f5f5; border-radius: 8px; text-decoration: none; color: #333; transition: all 0.2s; border: 1px solid #e0e0e0; width: calc(100% - 40px);">
                    <span class="link-icon">🔗</span>
                    <span class="link-name">링크</span>
                </a>
                <button class="link-delete-btn" onclick="deleteLink(${index})" style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 50%; background: rgba(231, 76, 60, 0.9); color: white; border: none; cursor: pointer; font-size: 0.9em; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;">×</button>
            `;
        } else {
            const icon = link.iconEmoji || '🔗';
            const name = link.name || '링크';
            const url = link.url || link;
            linkItem.innerHTML = `
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="detail-link" style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #f5f5f5; border-radius: 8px; text-decoration: none; color: #333; transition: all 0.2s; border: 1px solid #e0e0e0; width: calc(100% - 40px);">
                    <span class="link-icon">${icon}</span>
                    <span class="link-name">${escapeHtml(name)}</span>
                </a>
                <button class="link-delete-btn" onclick="deleteLink(${index})" style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 50%; background: rgba(231, 76, 60, 0.9); color: white; border: none; cursor: pointer; font-size: 0.9em; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;">×</button>
            `;
        }
        
        // 호버 시 삭제 버튼 표시
        linkItem.addEventListener('mouseenter', () => {
            const deleteBtn = linkItem.querySelector('.link-delete-btn');
            if (deleteBtn) {
                deleteBtn.style.opacity = '1';
            }
        });
        linkItem.addEventListener('mouseleave', () => {
            const deleteBtn = linkItem.querySelector('.link-delete-btn');
            if (deleteBtn) {
                deleteBtn.style.opacity = '0';
            }
        });
        
        detailPageLinksContainer.appendChild(linkItem);
    });
}

// 링크 삭제 함수
function deleteLink(index) {
    if (!currentTodo || !currentTodo.links) return;
    
    if (confirm('링크를 삭제하시겠습니까?')) {
        currentTodo.links.splice(index, 1);
        renderLinks(currentTodo.links);
        saveDetailPageWithoutAlert();
    }
}

// 전역 함수로 등록
window.deleteLink = deleteLink;

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 상세 페이지 저장 (알림 없이)
function saveDetailPageWithoutAlert() {
    if (!currentTodo) return;

    const title = detailPageTitle.value.trim();
    
    // 메모 내용 가져오기
    const noteTextarea = document.getElementById('detailPageNote');
    const note = noteTextarea ? noteTextarea.value.trim() : '';

    if (!title) {
        return;
    }

    // 카드 위치 저장
    saveAllCardPositions();

    // todos 배열에서 해당 todo 찾아서 업데이트
    const todoIndex = todos.findIndex(t => t.id === currentTodo.id);
    if (todoIndex !== -1) {
        todos[todoIndex].title = title;
        todos[todoIndex].note = note;
        todos[todoIndex].photos = currentTodo.photos || [];
        todos[todoIndex].links = currentTodo.links || [];
        todos[todoIndex].layout = currentTodo.layout || {};
        
        saveTodos();
        
        // 부모 창이 있으면 (새 창으로 열린 경우) 리로드
        if (window.opener) {
            window.opener.location.reload();
        }
    }
}

// 상세 페이지 저장
function saveDetailPage() {
    if (!currentTodo) return;

    const title = detailPageTitle.value.trim();
    
    // 메모 내용 가져오기
    const noteTextarea = document.getElementById('detailPageNote');
    const note = noteTextarea ? noteTextarea.value.trim() : '';

    if (!title) {
        alert('제목을 입력해주세요.');
        detailPageTitle.focus();
        return;
    }

    // 카드 위치 저장
    saveAllCardPositions();

    // todos 배열에서 해당 todo 찾아서 업데이트
    const todoIndex = todos.findIndex(t => t.id === currentTodo.id);
    if (todoIndex !== -1) {
        todos[todoIndex].title = title;
        todos[todoIndex].note = note;
        todos[todoIndex].photos = currentTodo.photos || [];
        todos[todoIndex].links = currentTodo.links || [];
        todos[todoIndex].layout = currentTodo.layout || {};
        
        saveTodos();
        
        // 부모 창이 있으면 (새 창으로 열린 경우) 리로드
        if (window.opener) {
            window.opener.location.reload();
        }
        
        alert('저장되었습니다!');
    }
}

// 모든 카드 위치 및 상태 저장
function saveAllCardPositions() {
    if (!currentTodo) return;
    
    if (!currentTodo.layout) {
        currentTodo.layout = {};
    }
    
    const cards = canvasArea.querySelectorAll('.draggable-card');
    cards.forEach(card => {
        saveCardState(card);
    });
    
    // todos 배열에 반영
    const todoIndex = todos.findIndex(t => t.id === currentTodo.id);
    if (todoIndex !== -1) {
        todos[todoIndex].layout = currentTodo.layout;
        saveTodos();
    }
}

// Web Speech API 초기화
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'ko-KR';
            
            recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                if (finalTranscript) {
                    transcribedText += finalTranscript;
                }
                
                // 실시간으로 표시 (transcriptionArea가 표시되어 있을 때)
                if (isRecording && transcriptionArea.style.display !== 'none') {
                    transcriptionText.textContent = transcribedText + interimTranscript;
                }
            };
            
            recognition.onerror = (event) => {
                console.error('음성 인식 오류:', event.error);
                // 중요한 오류만 사용자에게 알림
                if (event.error === 'not-allowed') {
                    console.warn('마이크 권한이 거부되었습니다. MediaRecorder는 계속 작동합니다.');
                } else if (event.error === 'no-speech') {
                    // 무음일 때는 오류로 처리하지 않음
                    return;
                } else if (event.error !== 'aborted' && event.error !== 'network') {
                    // 일부 오류는 조용히 처리
                    console.warn('음성 인식 오류 (계속 시도):', event.error);
                }
            };
            
            recognition.onend = () => {
                // 녹음이 계속 중이면 재시작 (권한 오류가 아닌 경우만)
                if (isRecording && recordingStream) {
                    try {
                        recognition.start();
                    } catch (e) {
                        // 재시작 실패는 조용히 처리 (이미 실행 중일 수 있음)
                        console.log('음성 인식 재시작:', e.message || e);
                    }
                }
            };
        } catch (e) {
            console.warn('Web Speech API 초기화 실패:', e);
            recognition = null;
        }
    } else {
        console.warn('이 브라우저는 Web Speech API를 지원하지 않습니다.');
    }
}

// 녹음 시작
async function startRecording() {
    try {
        // 마이크 권한 요청 (한 번만)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recordingStream = stream;
        
        // MediaRecorder 설정
        const options = { mimeType: 'audio/webm' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            // webm을 지원하지 않으면 기본 형식 사용
            options.mimeType = '';
        }
        
        mediaRecorder = new MediaRecorder(stream, options);
        audioChunks = [];
        transcribedText = ''; // 텍스트 초기화
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
            console.log('녹음 완료, 길이:', audioBlob.size, 'bytes');
            
            // 녹음이 성공적으로 완료되었는지 확인
            if (audioBlob.size > 0) {
                console.log('녹음 성공!');
            } else {
                console.warn('녹음된 데이터가 없습니다.');
            }
        };
        
        // 녹음 시작
        mediaRecorder.start(1000); // 1초마다 데이터 수집
        isRecording = true;
        recordingStartTime = Date.now();
        
        // UI 업데이트 (먼저 UI 업데이트)
        recordBtn.style.display = 'none';
        stopRecordBtn.style.display = 'flex';
        recordingStatus.style.display = 'block';
        transcriptionArea.style.display = 'none';
        
        // 타이머 시작
        recordingTimer = setInterval(updateRecordingTime, 1000);
        updateRecordingTime();
        
        // Web Speech API 시작 (권한을 이미 받았으므로 별도 요청 없이 시작)
        // 약간의 딜레이를 주어 MediaRecorder가 완전히 시작된 후 실행
        setTimeout(() => {
            if (recognition && isRecording) {
                transcribedText = '';
                try {
                    recognition.start();
                    console.log('Web Speech API 시작');
                } catch (e) {
                    // 이미 실행 중이거나 다른 이유로 실패할 수 있음
                    console.log('Web Speech API 시작 오류 (무시됨):', e.message || e);
                    // Web Speech API 실패해도 녹음은 계속 진행
                }
            }
        }, 500);
        
    } catch (error) {
        console.error('녹음 시작 오류:', error);
        
        // UI 복원
        recordBtn.style.display = 'flex';
        stopRecordBtn.style.display = 'none';
        recordingStatus.style.display = 'none';
        isRecording = false;
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            alert('마이크 권한이 거부되었습니다.\n\n브라우저 주소창 옆의 자물쇠 아이콘을 클릭하여 마이크 권한을 허용해주세요.');
        } else if (error.name === 'NotFoundError') {
            alert('마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.');
        } else {
            alert('녹음을 시작할 수 없습니다: ' + error.message);
        }
    }
}

// 녹음 중지
function stopRecording() {
    if (!isRecording) {
        // 이미 중지된 상태인 경우 UI만 복원
        recordBtn.style.display = 'flex';
        stopRecordBtn.style.display = 'none';
        recordingStatus.style.display = 'none';
        return;
    }
    
    isRecording = false;
    
    // 먼저 Web Speech API 중지 (MediaRecorder보다 먼저)
    if (recognition) {
        try {
            recognition.abort(); // stop() 대신 abort() 사용하여 즉시 중지
        } catch (e) {
            try {
                recognition.stop();
            } catch (e2) {
                console.log('음성 인식 중지:', e2.message || e2);
            }
        }
    }
    
    // MediaRecorder 중지
    if (mediaRecorder) {
        if (mediaRecorder.state === 'recording') {
            try {
                mediaRecorder.stop();
                console.log('MediaRecorder 중지됨');
            } catch (e) {
                console.error('MediaRecorder 중지 오류:', e);
            }
        } else {
            console.log('MediaRecorder 상태:', mediaRecorder.state);
        }
    }
    
    // 스트림 종료 (약간의 딜레이를 주어 MediaRecorder가 데이터를 처리할 시간 제공)
    setTimeout(() => {
        if (recordingStream) {
            recordingStream.getTracks().forEach(track => {
                track.stop();
                console.log('오디오 트랙 중지됨');
            });
            recordingStream = null;
        }
    }, 100);
    
    // 타이머 중지
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
        recordingStartTime = null;
    }
    
    // UI 업데이트
    recordBtn.style.display = 'flex';
    stopRecordBtn.style.display = 'none';
    recordingStatus.style.display = 'none';
    
    // 전사 결과 확인 및 표시
    setTimeout(() => {
        if (transcribedText.trim()) {
            transcriptionArea.style.display = 'block';
            transcriptionText.textContent = transcribedText;
            summarizeBtn.style.display = 'flex';
        } else {
            // Web Speech API가 작동하지 않았을 수 있음
            transcriptionArea.style.display = 'block';
            transcriptionText.innerHTML = `
                <div style="color: #999; margin-bottom: 8px;">
                    음성 인식이 작동하지 않았습니다.<br>
                    <small>수동으로 텍스트를 입력하거나 다시 녹음해주세요.</small>
                </div>
                <textarea id="manualTranscription" style="width: 100%; min-height: 100px; padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px; font-family: inherit;" placeholder="여기에 직접 텍스트를 입력하거나 다시 녹음해주세요..."></textarea>
            `;
            summarizeBtn.style.display = 'none';
            
            // 수동 입력 텍스트 영역이 있으면 이벤트 리스너 추가
            setTimeout(() => {
                const manualInput = document.getElementById('manualTranscription');
                if (manualInput) {
                    manualInput.addEventListener('input', (e) => {
                        const text = e.target.value.trim();
                        if (text) {
                            transcribedText = text;
                            summarizeBtn.style.display = 'flex';
                        } else {
                            summarizeBtn.style.display = 'none';
                        }
                    });
                }
            }, 100);
        }
    }, 300);
}

// 녹음 시간 업데이트
function updateRecordingTime() {
    if (!recordingStartTime) return;
    
    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    recordingTime.textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 전사된 텍스트를 메모에 추가
function insertTranscription() {
    const noteTextarea = document.getElementById('detailPageNote');
    if (!noteTextarea) return;
    
    const currentNote = noteTextarea.value;
    
    // 수동 입력 텍스트 영역이 있으면 먼저 확인
    const manualInput = document.getElementById('manualTranscription');
    let newText = '';
    
    if (manualInput && manualInput.value.trim()) {
        newText = manualInput.value.trim();
    } else {
        newText = transcribedText.trim();
    }
    
    if (!newText) {
        alert('추가할 텍스트가 없습니다.');
        return;
    }
    
    // 현재 메모가 있으면 줄바꿈 추가
    if (currentNote) {
        noteTextarea.value = currentNote + '\n\n' + newText;
    } else {
        noteTextarea.value = newText;
    }
    
    // 전사 영역 숨기기
    if (transcriptionArea) {
        transcriptionArea.style.display = 'none';
    }
    if (summarizeBtn) {
        summarizeBtn.style.display = 'none';
    }
    transcribedText = '';
    
    // 커서를 텍스트 영역으로 이동
    noteTextarea.focus();
    noteTextarea.setSelectionRange(noteTextarea.value.length, noteTextarea.value.length);
}

// AI 요약 기능 (Gemini API 사용)
async function summarizeText() {
    const text = transcribedText.trim();
    
    if (!text) {
        alert('요약할 텍스트가 없습니다.');
        return;
    }
    
    // Gemini API 키 확인
    let apiKey = localStorage.getItem('gemini_api_key');
    
    // 공백 제거 및 검증
    if (apiKey) {
        apiKey = apiKey.trim();
    }
    
    if (!apiKey || apiKey.length < 30) {
        // 보안을 위해 prompt로 한 번만 입력받기 (설정 화면 없음)
        const inputKey = prompt('Google Gemini API 키를 입력해주세요.\n\n⚠️ 보안: 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.\n\n키가 없으면 https://aistudio.google.com/app/apikey 에서 발급받으세요.');
        
        if (!inputKey || !inputKey.trim()) {
            alert('API 키가 필요합니다. AI 요약 기능을 사용하려면 API 키를 입력해주세요.');
            return;
        }
        
        // 기본적인 형식 검증
        const trimmedKey = inputKey.trim();
        if (!trimmedKey.startsWith('AIza')) {
            alert('올바른 Gemini API 키 형식이 아닙니다. (AIza로 시작해야 합니다)');
            return;
        }
        
        // LocalStorage에 저장
        apiKey = trimmedKey;
        localStorage.setItem('gemini_api_key', apiKey);
    }
    
    // 키 길이 확인 (최소 길이 체크)
    if (apiKey.length < 30) {
        alert('API 키가 너무 짧습니다. 올바른 키인지 확인해주세요.');
        return;
    }
    
    summarizeBtn.classList.add('loading');
    summarizeBtn.disabled = true;
    summarizeBtn.innerHTML = '<span>⏳</span><span>요약 중...</span>';
    
    try {
        // Gemini API 호출 - 여러 모델 시도 (fallback)
        // Google AI Studio 키는 v1beta 또는 v1 사용
        const apiVersions = ['v1beta', 'v1'];
        const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
        let data = null;
        let lastError = null;
        let successModel = null;
        
        // 각 API 버전과 모델 조합 시도
        outerLoop: for (const apiVersion of apiVersions) {
            for (const model of models) {
                try {
                    const response = await fetch(`https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: `다음 텍스트를 간결하고 명확하게 3-5개의 문장으로 요약해주세요:\n\n${text}`
                                }]
                            }],
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 200
                            }
                        })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        const errorMsg = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
                        
                        // 모델을 찾을 수 없는 경우 다음 모델 시도
                        if (errorMsg.includes('not found') || errorMsg.includes('not supported')) {
                            console.log(`API ${apiVersion}, 모델 ${model}을 사용할 수 없음, 다음 시도...`);
                            lastError = new Error(errorMsg);
                            continue;
                        }
                        
                        throw new Error(errorMsg);
                    }
                    
                    data = await response.json();
                    
                    // 응답 구조 확인
                    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
                        console.error('예상치 못한 Gemini API 응답 구조:', data);
                        lastError = new Error('API 응답 형식이 예상과 다릅니다.');
                        continue;
                    }
                    
                    // 성공적으로 응답을 받았으면 루프 종료
                    successModel = `${apiVersion}/${model}`;
                    console.log(`✅ 성공: ${successModel} 모델 사용`);
                    break outerLoop;
                } catch (error) {
                    // 네트워크 오류가 아닌 모델 오류면 다음 모델 시도
                    if (error.message.includes('not found') || error.message.includes('not supported')) {
                        lastError = error;
                        continue;
                    }
                    // 다른 오류면 즉시 throw
                    throw error;
                }
            }
        }
        
        // 모든 모델 실패 시
        if (!data) {
            throw lastError || new Error('사용 가능한 Gemini 모델을 찾을 수 없습니다.');
        }
        
        const summary = data.candidates[0].content.parts[0].text.trim();
        
        // 요약 결과 표시
        transcriptionText.innerHTML = `
            <div style="margin-bottom: 12px;">
                <strong>원문:</strong><br>
                <div style="color: #666; margin-top: 4px;">${escapeHtml(text)}</div>
            </div>
            <div style="padding-top: 12px; border-top: 1px solid #e0e0e0;">
                <strong style="color: #667eea;">AI 요약:</strong><br>
                <div style="color: #333; margin-top: 4px; font-weight: 500;">${escapeHtml(summary)}</div>
            </div>
        `;
        
        // 전사된 텍스트를 요약으로 교체
        transcribedText = summary;
        
    } catch (error) {
        console.error('AI 요약 오류:', error);
        console.error('사용된 API 키 (처음 10자):', apiKey ? apiKey.substring(0, 10) + '...' : '없음');
        
        let errorMessage = '요약 중 오류가 발생했습니다: ' + error.message;
        
        // 특정 에러 타입에 대한 안내
        if (error.message.includes('is not found') || error.message.includes('not supported')) {
            errorMessage += '\n\n❌ 모델을 찾을 수 없습니다.\n\n';
            errorMessage += '사용 가능한 모델로 변경합니다. 잠시 후 다시 시도해주세요.';
            // 다른 모델로 자동 재시도 로직은 나중에 추가 가능
        } else if (error.message.includes('API_KEY_INVALID') || error.message.includes('Invalid API key') || error.message.includes('API key not valid')) {
            errorMessage += '\n\n❌ API 키가 올바르지 않습니다.\n\n';
            errorMessage += '해결 방법:\n';
            errorMessage += '1. "🔑 키" 버튼을 클릭하여 키를 확인하세요\n';
            errorMessage += '2. Gemini에서 새 키를 발급받으세요: https://aistudio.google.com/app/apikey\n';
            errorMessage += '3. 키 재설정 후 다시 시도하세요';
        } else if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('quota')) {
            errorMessage += '\n\n❌ API 사용량 한도를 초과했습니다.\n\n';
            errorMessage += 'Gemini API 사용량을 확인하세요: https://aistudio.google.com/app/apikey';
        } else if (error.message.includes('Rate limit') || error.message.includes('429')) {
            errorMessage += '\n\n❌ 요청 한도를 초과했습니다.\n\n잠시 후 다시 시도해주세요.';
        }
        
        alert(errorMessage);
    } finally {
        summarizeBtn.classList.remove('loading');
        summarizeBtn.disabled = false;
        summarizeBtn.innerHTML = '<span>🤖</span><span>AI 요약</span>';
    }
}

// API 키 상태 확인 및 관리 (Gemini) - 키 버튼이 제거되었으므로 직접 호출되지 않음

// API 키를 기본 키로 재설정 (Gemini)
function resetApiKey() {
    const defaultApiKey = 'AIzaSyBtJisIdyUUlKdAQTjjnzzjrgQMiyiQI-A';
    
    if (confirm('Gemini API 키를 기본 키로 재설정하시겠습니까?\n\n기존 키는 삭제되고 기본 키로 교체됩니다.\n\n⚠️ 이 키가 작동하지 않으면 Gemini에서 새 키를 발급받아주세요.')) {
        localStorage.setItem('gemini_api_key', defaultApiKey.trim());
        alert('✅ Gemini API 키가 기본 키로 재설정되었습니다!\n\n키가 작동하지 않으면 https://aistudio.google.com/app/apikey 에서 새 키를 발급받아주세요.');
    }
}

// API 키 변경 함수 (Gemini)
function changeApiKey() {
    const newKey = prompt(
        '새로운 Gemini API 키를 입력해주세요:\n\n' +
        '⚠️ 기존 키는 삭제되고 새 키로 교체됩니다.\n\n' +
        '키가 없으면 https://aistudio.google.com/app/apikey 에서 발급받으세요.',
        ''
    );
    
    if (!newKey || !newKey.trim()) {
        return;
    }
    
    if (!newKey.trim().startsWith('AIza')) {
        alert('올바른 Gemini API 키 형식이 아닙니다. (AIza로 시작해야 합니다)');
        return;
    }
    
    localStorage.setItem('gemini_api_key', newKey.trim());
    alert('✅ Gemini API 키가 변경되었습니다!');
}

// API 키 삭제 함수 (Gemini)
function deleteApiKey() {
    if (confirm('⚠️ 저장된 Gemini API 키를 삭제하시겠습니까?\n\n삭제 후 AI 요약 기능을 사용하려면 다시 입력해야 합니다.')) {
        localStorage.removeItem('gemini_api_key');
        alert('✅ Gemini API 키가 삭제되었습니다.');
    }
}

// 전역 함수로 노출
window.deletePhoto = deletePhoto;

