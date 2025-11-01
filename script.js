// LocalStorage 키
const STORAGE_KEY = 'simple-todos';
const LINKS_STORAGE_KEY = 'simple-links';

// 상태 관리
let todos = [];
let savedLinks = [];
let currentDate = new Date();
let selectedDate = null;

// DOM 요소
const todoList = document.getElementById('todoList');
const calendarGrid = document.getElementById('calendarGrid');
const monthNumber = document.getElementById('monthNumber');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const selectedDateHeader = document.getElementById('selectedDateHeader');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoModal = document.getElementById('todoModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const todoForm = document.getElementById('todoForm');
const modalTitle = document.getElementById('modalTitle');
const linksContainer = document.getElementById('linksContainer');
const linksGrid = document.getElementById('linksGrid');
const addLinkIconBtn = document.getElementById('addLinkIconBtn');
const linkModal = document.getElementById('linkModal');
const linkForm = document.getElementById('linkForm');
const closeLinkModalBtn = document.getElementById('closeLinkModal');
const cancelLinkBtn = document.getElementById('cancelLinkBtn');
const linkIconSelect = document.getElementById('linkIconSelect');
const detailModal = document.getElementById('detailModal');
const closeDetailModalBtn = document.getElementById('closeDetailModal');
const cancelDetailBtn = document.getElementById('cancelDetailBtn');
const saveDetailBtn = document.getElementById('saveDetailBtn');
const photoUpload = document.getElementById('photoUpload');
const addPhotoBtn = document.getElementById('addPhotoBtn');
const photosContainer = document.getElementById('photosContainer');
const horoscopeBtn = document.getElementById('horoscopeBtn');
const horoscopeModal = document.getElementById('horoscopeModal');
const horoscopeForm = document.getElementById('horoscopeForm');
const closeHoroscopeModalBtn = document.getElementById('closeHoroscopeModal');
const cancelHoroscopeBtn = document.getElementById('cancelHoroscopeBtn');
const horoscopeResultModal = document.getElementById('horoscopeResultModal');
const horoscopeResultTitle = document.getElementById('horoscopeResultTitle');
const horoscopeResultContent = document.getElementById('horoscopeResultContent');
const closeHoroscopeResultModalBtn = document.getElementById('closeHoroscopeResultModal');
const closeHoroscopeResultBtn = document.getElementById('closeHoroscopeResultBtn');
const birthDateInput = document.getElementById('birthDate');
const zodiacSignSelect = document.getElementById('zodiacSign');

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    loadSavedLinks();
    setupEventListeners();
    
    // 저장된 날짜와 월 복원
    const savedSelectedDate = localStorage.getItem('calendar_selectedDate');
    const savedCurrentDate = localStorage.getItem('calendar_currentDate');
    
    if (savedCurrentDate) {
        currentDate = new Date(savedCurrentDate);
    } else {
        currentDate = new Date();
    }
    
    if (savedSelectedDate) {
        selectedDate = new Date(savedSelectedDate);
    } else {
        selectedDate = new Date();
    }
    
    renderCalendar();
    updateSelectedDateHeader();
    renderTodos();
    renderSavedLinks();
    setupLinkModal();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        // 날짜 변경 시 저장
        if (currentDate) {
            localStorage.setItem('calendar_currentDate', currentDate.toISOString());
        }
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
        // 날짜 변경 시 저장
        if (currentDate) {
            localStorage.setItem('calendar_currentDate', currentDate.toISOString());
        }
    });

    addTodoBtn.addEventListener('click', () => {
        openModal();
    });

    // 운세 확인 버튼
    if (horoscopeBtn) {
        horoscopeBtn.addEventListener('click', () => {
            openHoroscopeModal();
        });
    }

    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // 운세 모달 이벤트 리스너
    if (closeHoroscopeModalBtn) {
        closeHoroscopeModalBtn.addEventListener('click', closeHoroscopeModal);
    }
    if (cancelHoroscopeBtn) {
        cancelHoroscopeBtn.addEventListener('click', closeHoroscopeModal);
    }
    if (horoscopeModal) {
        horoscopeModal.addEventListener('click', (e) => {
            if (e.target === horoscopeModal) {
                closeHoroscopeModal();
            }
        });
    }
    if (horoscopeForm) {
        horoscopeForm.addEventListener('submit', handleHoroscopeSubmit);
    }

    // 운세 결과 모달 이벤트 리스너
    if (closeHoroscopeResultModalBtn) {
        closeHoroscopeResultModalBtn.addEventListener('click', closeHoroscopeResultModal);
    }
    if (closeHoroscopeResultBtn) {
        closeHoroscopeResultBtn.addEventListener('click', closeHoroscopeResultModal);
    }
    if (horoscopeResultModal) {
        horoscopeResultModal.addEventListener('click', (e) => {
            if (e.target === horoscopeResultModal) {
                closeHoroscopeResultModal();
            }
        });
    }

    // 생년월일 입력 시 별자리 자동 설정
    if (birthDateInput && zodiacSignSelect) {
        birthDateInput.addEventListener('change', (e) => {
            const birthDate = new Date(e.target.value);
            const zodiac = calculateZodiacSign(birthDate);
            if (zodiac) {
                zodiacSignSelect.value = zodiac;
            }
        });
    }

    todoModal.addEventListener('click', (e) => {
        if (e.target === todoModal) {
            closeModal();
        }
    });

    todoForm.addEventListener('submit', handleSubmit);

    addLinkIconBtn.addEventListener('click', () => {
        openLinkModal();
    });

    // 상세보기 모달 이벤트 리스너
    closeDetailModalBtn.addEventListener('click', closeDetailModal);
    cancelDetailBtn.addEventListener('click', closeDetailModal);
    saveDetailBtn.addEventListener('click', saveDetailModal);

    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) {
            closeDetailModal();
        }
    });

    // 사진 업로드 버튼
    addPhotoBtn.addEventListener('click', () => {
        photoUpload.click();
    });

    photoUpload.addEventListener('change', handlePhotoUpload);
}

// 링크 모달 설정
function setupLinkModal() {
    // 서비스 선택 옵션 채우기
    linkIconSelect.innerHTML = '<option value="">서비스 선택</option>' +
        commonServices.map(service => 
            `<option value="${service.value}">${service.icon} ${service.name}</option>`
        ).join('');

    linkIconSelect.addEventListener('change', (e) => {
        const selected = commonServices.find(s => s.value === e.target.value);
        if (selected && selected.value !== 'custom') {
            document.getElementById('linkName').value = selected.name;
        } else if (selected && selected.value === 'custom') {
            // 직접 입력 선택 시 이름 필드 비우기 (placeholder는 유지)
            document.getElementById('linkName').value = '';
        }
    });

    closeLinkModalBtn.addEventListener('click', closeLinkModal);
    cancelLinkBtn.addEventListener('click', closeLinkModal);

    linkModal.addEventListener('click', (e) => {
        if (e.target === linkModal) {
            closeLinkModal();
        }
    });

    linkForm.addEventListener('submit', handleLinkSubmit);
}

// UUID 생성
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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

// LocalStorage에 데이터 저장
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// LocalStorage에서 저장된 링크 로드
function loadSavedLinks() {
    const stored = localStorage.getItem(LINKS_STORAGE_KEY);
    if (stored) {
        try {
            savedLinks = JSON.parse(stored);
        } catch (e) {
            console.error('링크 데이터 로드 오류:', e);
            savedLinks = [];
        }
    } else {
        savedLinks = [];
    }
}

// LocalStorage에 저장된 링크 저장
function saveSavedLinks() {
    localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(savedLinks));
}

// 캘린더 렌더링
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 월과 년도 표시 업데이트
    monthNumber.textContent = `${year}년 ${month + 1}월`;

    // 해당 월의 첫 번째 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 첫 번째 날의 요일 (0=일요일, 1=월요일, ... 6=토요일)
    const firstDayOfWeek = firstDay.getDay();
    // 월요일 기준으로 조정 (월요일이 0이 되도록)
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // 이전 달의 마지막 날들
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    calendarGrid.innerHTML = '';

    // 이전 달의 날짜들
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const date = new Date(year, month - 1, day);
        createCalendarDay(date, true);
    }

    // 현재 달의 날짜들
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        createCalendarDay(date, false);
    }

    // 다음 달의 날짜들 (캘린더를 6주로 채우기 위해)
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells; // 6주 x 7일
    for (let day = 1; day <= remainingCells; day++) {
        const date = new Date(year, month + 1, day);
        createCalendarDay(date, true);
    }
}

// 캘린더 날짜 셀 생성
function createCalendarDay(date, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }

    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    
    if (isToday) {
        dayElement.classList.add('today');
    }
    
    if (isSelected) {
        dayElement.classList.add('selected');
    }

    // 해당 날짜에 Todo가 있는지 확인
    const dateStr = date.toISOString().split('T')[0];
    const dayTodos = todos.filter(todo => todo.dueDate === dateStr);
    
    if (dayTodos.length > 0) {
        dayElement.classList.add('has-events');
    }

    // Todo 제목들을 작은 글씨로 표시
    let todoTitlesHTML = '';
    if (dayTodos.length > 0) {
        todoTitlesHTML = dayTodos.slice(0, 3).map(todo => {
            const colors = ['#667eea', '#f59e0b', '#10b981', '#ef4444'];
            const color = colors[todo.colorIndex % colors.length] || '#667eea';
            return `<div class="calendar-todo-title" style="border-left: 3px solid ${color}">${escapeHtml(todo.title)}</div>`;
        }).join('');
    }

    dayElement.innerHTML = `
        <div class="day-number">${date.getDate()}</div>
        ${todoTitlesHTML ? `<div class="calendar-todo-titles">${todoTitlesHTML}</div>` : ''}
    `;

    dayElement.addEventListener('click', () => {
        selectedDate = new Date(date);
        updateSelectedDateHeader();
        renderTodos();
        // 선택된 날짜 변경 시 저장
        // 현재 보고 있는 월도 해당 날짜의 월로 업데이트
        if (date.getMonth() !== currentDate.getMonth() || date.getFullYear() !== currentDate.getFullYear()) {
            currentDate = new Date(date.getFullYear(), date.getMonth(), 1);
        }
        if (selectedDate) {
            localStorage.setItem('calendar_selectedDate', selectedDate.toISOString());
        }
        if (currentDate) {
            localStorage.setItem('calendar_currentDate', currentDate.toISOString());
        }
        renderCalendar();
    });

    calendarGrid.appendChild(dayElement);
}

// 선택된 날짜 헤더 업데이트
function updateSelectedDateHeader() {
    if (!selectedDate) return;
    
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'short' 
    };
    const formatted = selectedDate.toLocaleDateString('ko-KR', options);
    selectedDateHeader.textContent = formatted;
}

// To-Do 목록 렌더링
function renderTodos() {
    if (!selectedDate) {
        selectedDate = new Date();
    }

    const dateStr = selectedDate.toISOString().split('T')[0];
    const filteredTodos = todos.filter(todo => todo.dueDate === dateStr);

    // 시간순 정렬 (시간이 있는 경우)
    filteredTodos.sort((a, b) => {
        if (a.startTime && b.startTime) {
            return a.startTime.localeCompare(b.startTime);
        }
        if (a.startTime) return -1;
        if (b.startTime) return 1;
        return 0;
    });

    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">해당 날짜에 할 일이 없습니다.</div>';
        return;
    }

    filteredTodos.forEach(todo => {
        const todoElement = createTodoElement(todo);
        todoList.appendChild(todoElement);
    });
}

// To-Do 요소 생성
function createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = 'todo-item';
    
    // Todo 색상 결정 (캘린더와 동일한 로직)
    const colors = ['#667eea', '#f59e0b', '#10b981', '#ef4444'];
    const color = colors[(todo.colorIndex || 0) % colors.length] || '#667eea';
    div.style.borderLeftColor = color;

    // 더블클릭 이벤트 - 인라인 편집
    let isEditing = false;
    div.addEventListener('dblclick', (e) => {
        // 버튼 클릭 시에는 편집 모드가 활성화되지 않도록
        if (e.target.classList.contains('btn-edit') || 
            e.target.classList.contains('btn-delete') || 
            e.target.classList.contains('btn-detail') ||
            e.target.tagName === 'A') {
            return;
        }
        
        if (isEditing) return;
        isEditing = true;
        
        // 제목 인라인 편집
        const titleElement = div.querySelector('.todo-title');
        const originalTitle = todo.title;
        
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = originalTitle;
        titleInput.className = 'todo-title-edit';
        titleInput.style.width = '100%';
        titleInput.style.padding = '4px 8px';
        titleInput.style.fontSize = '1.1em';
        titleInput.style.fontWeight = '600';
        titleInput.style.border = '2px solid #667eea';
        titleInput.style.borderRadius = '4px';
        
        titleElement.innerHTML = '';
        titleElement.appendChild(titleInput);
        titleInput.focus();
        titleInput.select();
        
        const finishEdit = () => {
            const newTitle = titleInput.value.trim();
            if (newTitle && newTitle !== originalTitle) {
                todo.title = newTitle;
                saveTodos();
                renderCalendar();
                renderTodos();
            } else {
                renderTodos();
            }
            isEditing = false;
        };
        
        titleInput.addEventListener('blur', finishEdit);
        titleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEdit();
            } else if (e.key === 'Escape') {
                renderTodos();
                isEditing = false;
            }
        });
    });

    // 시간 표시
    let timeHTML = '';
    if (todo.startTime && todo.endTime) {
        const startTime = formatTime(todo.startTime);
        const endTime = formatTime(todo.endTime);
        timeHTML = `<div class="todo-time">${startTime} - ${endTime}</div>`;
    } else if (todo.startTime) {
        const startTime = formatTime(todo.startTime);
        timeHTML = `<div class="todo-time">${startTime}</div>`;
    }

    // 위치/메모 표시
    const locationHTML = todo.note ? `<div class="todo-location">${escapeHtml(todo.note)}</div>` : '';

    // 링크 표시 (아이콘 형태)
    let linksHTML = '';
    if (todo.links && todo.links.length > 0) {
        linksHTML = `<div class="todo-links">${todo.links.map(link => {
            // 기존 문자열 형태 호환성
            if (typeof link === 'string') {
                return `<a href="${link}" target="_blank" rel="noopener noreferrer" class="link-icon-item">
                    <span class="link-icon">🔗</span>
                    <span class="link-name">링크</span>
                </a>`;
            }
            // 새로운 객체 형태
            const icon = link.iconEmoji || '🔗';
            const name = link.name || '링크';
            const url = link.url || link;
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="link-icon-item" title="${name}">
                <span class="link-icon">${icon}</span>
                <span class="link-name">${escapeHtml(name)}</span>
            </a>`;
        }).join('')}</div>`;
    }

    div.innerHTML = `
        ${timeHTML}
        <div class="todo-title">
            ${escapeHtml(todo.title)}
        </div>
        ${locationHTML}
        ${linksHTML}
        <div class="todo-actions">
            <button class="btn-detail" onclick="event.stopPropagation(); openDetailPage('${todo.id}')" title="상세보기">📄</button>
            <button class="btn-edit" onclick="event.stopPropagation(); editTodo('${todo.id}')" title="수정">✎</button>
            <button class="btn-delete" onclick="event.stopPropagation(); deleteTodo('${todo.id}')" title="삭제">×</button>
        </div>
    `;

    return div;
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

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 모달 열기
function openModal(todoId = null) {
    const todo = todoId ? todos.find(t => t.id === todoId) : null;

    if (todo) {
        modalTitle.textContent = '이벤트 수정';
        document.getElementById('todoId').value = todo.id;
        document.getElementById('todoTitle').value = todo.title;
        document.getElementById('todoNote').value = todo.note || '';
        document.getElementById('todoDueDate').value = todo.dueDate;
        document.getElementById('todoStartTime').value = todo.startTime || '';
        document.getElementById('todoEndTime').value = todo.endTime || '';
        
        // 링크 필드 초기화 및 채우기
        linksContainer.innerHTML = '';
        if (todo.links && todo.links.length > 0) {
            todo.links.forEach(link => {
                // 기존 문자열 형태 호환성
                if (typeof link === 'string') {
                    addLinkField({ url: link, name: '', icon: '' });
                } else {
                    addLinkField(link);
                }
            });
        }
    } else {
        modalTitle.textContent = '새로운 이벤트 추가';
        document.getElementById('todoId').value = '';
        document.getElementById('todoTitle').value = '';
        document.getElementById('todoNote').value = '';
        const defaultDate = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        document.getElementById('todoDueDate').value = defaultDate;
        document.getElementById('todoStartTime').value = '';
        document.getElementById('todoEndTime').value = '';
        linksContainer.innerHTML = '';
    }

    todoModal.classList.add('active');
    
    // 링크 추가 버튼 이벤트 리스너 설정
    const addLinkBtn = document.getElementById('addLinkBtn');
    addLinkBtn.onclick = () => addLinkField();
}

// 모달 닫기
function closeModal() {
    todoModal.classList.remove('active');
    todoForm.reset();
    linksContainer.innerHTML = '';
}

// 일반 서비스 목록
const commonServices = [
    { name: 'GitHub', icon: '🐙', value: 'github' },
    { name: 'YouTube', icon: '▶️', value: 'youtube' },
    { name: 'Notion', icon: '📝', value: 'notion' },
    { name: 'Slack', icon: '💬', value: 'slack' },
    { name: 'ChatGPT', icon: '🤖', value: 'chatgpt' },
    { name: 'Gemini', icon: '💎', value: 'gemini' },
    { name: 'Google', icon: '🔍', value: 'google' },
    { name: '직접 입력', icon: '✏️', value: 'custom' },
];

// 링크 필드 추가
function addLinkField(linkData = null) {
    const linkGroup = document.createElement('div');
    linkGroup.className = 'link-input-group';
    
    // 아이콘 미리보기 (먼저 생성)
    const iconPreview = document.createElement('div');
    iconPreview.className = 'link-icon-preview';
    
    // 서비스 선택 드롭다운
    const serviceSelect = document.createElement('select');
    serviceSelect.className = 'service-select';
    const selectedIcon = linkData?.icon || '';
    serviceSelect.innerHTML = '<option value="">서비스 선택</option>' +
        commonServices.map(service => 
            `<option value="${service.value}" ${selectedIcon === service.value ? 'selected' : ''}>${service.icon} ${service.name}</option>`
        ).join('');
    
    // 기존 데이터가 있으면 선택된 서비스에 맞게 아이콘 설정
    if (linkData && linkData.icon) {
        const service = commonServices.find(s => s.value === linkData.icon);
        if (service) {
            iconPreview.textContent = service.icon;
        } else {
            iconPreview.textContent = '🔗';
        }
    } else {
        iconPreview.textContent = '🔗';
    }
    
    // 서비스 이름 입력
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'link-name-input';
    nameInput.placeholder = '서비스 이름';
    nameInput.value = linkData?.name || '';
    nameInput.style.flex = '1';
    
    // URL 입력
    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.className = 'link-url-input';
    urlInput.placeholder = 'https://example.com';
    urlInput.value = typeof linkData === 'string' ? linkData : (linkData?.url || '');
    urlInput.required = false;
    urlInput.style.flex = '2';

    // 서비스 선택 시 이름 및 아이콘 자동 입력
    serviceSelect.addEventListener('change', (e) => {
        const selected = commonServices.find(s => s.value === e.target.value);
        if (selected) {
            iconPreview.textContent = selected.icon;
            if (selected.value !== 'custom') {
                nameInput.value = selected.name;
            }
        }
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove-link';
    removeBtn.textContent = '삭제';
    removeBtn.onclick = () => linkGroup.remove();

    linkGroup.appendChild(iconPreview);
    linkGroup.appendChild(serviceSelect);
    linkGroup.appendChild(nameInput);
    linkGroup.appendChild(urlInput);
    linkGroup.appendChild(removeBtn);
    linksContainer.appendChild(linkGroup);
}

// 폼 제출 처리
function handleSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('todoId').value;
    const title = document.getElementById('todoTitle').value.trim();
    const note = document.getElementById('todoNote').value.trim();
    const dueDate = document.getElementById('todoDueDate').value;
    const startTime = document.getElementById('todoStartTime').value;
    const endTime = document.getElementById('todoEndTime').value;
    
    // 링크 수집 (서비스 이름, 아이콘, URL 포함)
    const linkGroups = linksContainer.querySelectorAll('.link-input-group');
    const links = Array.from(linkGroups).map(group => {
        const urlInput = group.querySelector('.link-url-input');
        const nameInput = group.querySelector('.link-name-input');
        const serviceSelect = group.querySelector('.service-select');
        const iconPreview = group.querySelector('.link-icon-preview');
        
        const url = urlInput.value.trim();
        if (!url) return null;
        
        const name = nameInput.value.trim() || '링크';
        const icon = serviceSelect.value || 'custom';
        const iconEmoji = iconPreview.textContent || '🔗';
        
        return {
            url,
            name,
            icon,
            iconEmoji
        };
    }).filter(link => link !== null);

    if (!title || !dueDate) {
        alert('제목과 날짜는 필수 입력 항목입니다.');
        return;
    }

    if (id) {
        // 수정
        const index = todos.findIndex(t => t.id === id);
        if (index !== -1) {
            todos[index] = {
                ...todos[index],
                title,
                note,
                links,
                dueDate,
                startTime,
                endTime,
            };
        }
    } else {
        // 추가
        const newTodo = {
            id: generateId(),
            title,
            note,
            links,
            dueDate,
            startTime,
            endTime,
            createdAt: new Date().toISOString(),
            colorIndex: todos.length, // 색상 인덱스
        };
        todos.push(newTodo);
    }

    saveTodos();
    closeModal();
    renderCalendar();
    renderTodos();
}

// To-Do 수정
function editTodo(id) {
    openModal(id);
}

// To-Do 삭제
function deleteTodo(id) {
    if (confirm('정말 삭제하시겠습니까?')) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        renderCalendar();
        renderTodos();
    }
}

// 저장된 링크 렌더링
function renderSavedLinks() {
    linksGrid.innerHTML = '';

    if (savedLinks.length === 0) {
        linksGrid.innerHTML = '<div style="width: 100%; text-align: center; color: #999; padding: 20px;">저장된 링크가 없습니다.</div>';
        return;
    }

    savedLinks.forEach((link, index) => {
        const linkCard = document.createElement('div');
        linkCard.className = 'link-icon-card';

        const service = commonServices.find(s => s.value === link.icon);
        const iconEmoji = service ? service.icon : '🔗';

        linkCard.innerHTML = `
            <button class="link-icon-delete" onclick="event.stopPropagation(); deleteSavedLink(${index})" title="삭제">×</button>
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <div class="link-icon-circle">${iconEmoji}</div>
                <div class="link-icon-label">${escapeHtml(link.name)}</div>
            </a>
        `;

        linksGrid.appendChild(linkCard);
    });
}

// 링크 모달 열기
function openLinkModal() {
    document.getElementById('linkName').value = '';
    document.getElementById('linkUrl').value = '';
    if (linkIconSelect) {
        linkIconSelect.value = '';
    }
    linkModal.classList.add('active');
}

// 링크 모달 닫기
function closeLinkModal() {
    linkModal.classList.remove('active');
    linkForm.reset();
}

// 링크 폼 제출 처리
function handleLinkSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('linkName').value.trim();
    const url = document.getElementById('linkUrl').value.trim();
    const icon = linkIconSelect.value || 'custom';

    if (!name || !url) {
        alert('서비스 이름과 URL은 필수 입력 항목입니다.');
        return;
    }

    const service = commonServices.find(s => s.value === icon);
    const iconEmoji = service ? service.icon : '🔗';

    const newLink = {
        id: generateId(),
        name,
        url,
        icon,
        iconEmoji,
        createdAt: new Date().toISOString(),
    };

    savedLinks.push(newLink);
    saveSavedLinks();
    closeLinkModal();
    renderSavedLinks();
}

// 저장된 링크 삭제
function deleteSavedLink(index) {
    if (confirm('정말 삭제하시겠습니까?')) {
        // ID로 찾아서 삭제하는 방식으로 변경 (인덱스 대신)
        const linkToDelete = savedLinks[index];
        if (linkToDelete) {
            savedLinks = savedLinks.filter((link, i) => i !== index);
            saveSavedLinks();
            renderSavedLinks();
        }
    }
}

// 상세보기 페이지 열기 (새 창)
function openDetailPage(todoId) {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    // 현재 보고 있는 날짜와 월을 저장
    if (selectedDate) {
        localStorage.setItem('calendar_selectedDate', selectedDate.toISOString());
    }
    if (currentDate) {
        localStorage.setItem('calendar_currentDate', currentDate.toISOString());
    }

    // 새 창으로 상세보기 페이지 열기
    window.open(`detail.html?id=${todoId}`, '_blank');
}

// 상세보기 모달 닫기
function closeDetailModal() {
    detailModal.classList.remove('active');
    photoUpload.value = ''; // 파일 입력 초기화
}

// 사진 렌더링
function renderPhotos(photos) {
    photosContainer.innerHTML = '';
    
    if (photos.length === 0) {
        return;
    }

    photos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
            <img src="${photo}" alt="사진 ${index + 1}" class="photo-preview" />
            <button class="photo-delete-btn" onclick="deletePhoto(${index})" title="삭제">×</button>
        `;
        photosContainer.appendChild(photoItem);
    });
}

// 사진 삭제
function deletePhoto(index) {
    const todoId = document.getElementById('detailTodoId').value;
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    if (!todo.photos) todo.photos = [];
    todo.photos.splice(index, 1);
    
    renderPhotos(todo.photos);
    saveTodos();
}

// 사진 업로드 처리
function handlePhotoUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const todoId = document.getElementById('detailTodoId').value;
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    if (!todo.photos) todo.photos = [];

    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                todo.photos.push(event.target.result);
                renderPhotos(todo.photos);
                saveTodos();
            };
            reader.readAsDataURL(file);
        }
    });

    // 파일 입력 초기화 (같은 파일을 다시 선택할 수 있도록)
    e.target.value = '';
}

// 상세보기 링크 렌더링
function renderDetailLinks(links) {
    const container = document.getElementById('detailLinksContainer');
    container.innerHTML = '';

    if (!links || links.length === 0) {
        container.innerHTML = '<div style="color: #999; padding: 10px;">링크가 없습니다.</div>';
        return;
    }

    links.forEach(link => {
        const linkItem = document.createElement('div');
        linkItem.className = 'detail-link-item';
        
        if (typeof link === 'string') {
            linkItem.innerHTML = `
                <a href="${link}" target="_blank" rel="noopener noreferrer" class="detail-link">
                    <span class="link-icon">🔗</span>
                    <span class="link-name">링크</span>
                </a>
            `;
        } else {
            const icon = link.iconEmoji || '🔗';
            const name = link.name || '링크';
            const url = link.url || link;
            linkItem.innerHTML = `
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="detail-link">
                    <span class="link-icon">${icon}</span>
                    <span class="link-name">${escapeHtml(name)}</span>
                </a>
            `;
        }
        
        container.appendChild(linkItem);
    });
}

// 상세보기 모달 저장
function saveDetailModal() {
    const todoId = document.getElementById('detailTodoId').value;
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const title = document.getElementById('detailTitle').value.trim();
    const note = document.getElementById('detailNote').value.trim();

    if (!title) {
        alert('제목을 입력해주세요.');
        return;
    }

    todo.title = title;
    todo.note = note;
    // 사진은 이미 handlePhotoUpload에서 저장됨

    saveTodos();
    closeDetailModal();
    renderCalendar();
    renderTodos();
}

// 전역 함수로 노출 (인라인 이벤트 핸들러용)
window.editTodo = editTodo;
window.deleteTodo = deleteTodo;
window.deleteSavedLink = deleteSavedLink;
window.deletePhoto = deletePhoto;
window.openDetailPage = openDetailPage;

// 운세 모달 열기
function openHoroscopeModal() {
    if (!horoscopeModal) return;
    horoscopeModal.classList.add('active');
    if (horoscopeForm) horoscopeForm.reset();
    if (birthDateInput) birthDateInput.value = '';
    if (zodiacSignSelect) zodiacSignSelect.value = '';
}

// 운세 모달 닫기
function closeHoroscopeModal() {
    if (!horoscopeModal) return;
    horoscopeModal.classList.remove('active');
    if (horoscopeForm) horoscopeForm.reset();
}

// 운세 결과 모달 닫기
function closeHoroscopeResultModal() {
    if (!horoscopeResultModal) return;
    horoscopeResultModal.classList.remove('active');
}

// 생년월일로 별자리 계산
function calculateZodiacSign(birthDate) {
    if (!birthDate || isNaN(birthDate.getTime())) return null;
    
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '양자리';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '황소자리';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return '쌍둥이자리';
    if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return '게자리';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '사자자리';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '처녀자리';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return '천칭자리';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return '전갈자리';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return '사수자리';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '염소자리';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '물병자리';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return '물고기자리';
    
    return null;
}

// 운세 확인 폼 제출 처리
function handleHoroscopeSubmit(e) {
    e.preventDefault();
    
    if (!birthDateInput || !zodiacSignSelect) return;
    
    const birthDate = birthDateInput.value;
    const zodiacSign = zodiacSignSelect.value;
    
    if (!birthDate || !zodiacSign) {
        alert('생년월일과 별자리를 모두 입력해주세요.');
        return;
    }
    
    const horoscope = generateHoroscope(zodiacSign, new Date(birthDate));
    
    // 결과 모달 표시
    if (horoscopeResultTitle) {
        const today = new Date();
        const todayStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
        horoscopeResultTitle.textContent = `${zodiacSign}의 ${todayStr} 운세`;
    }
    
    if (horoscopeResultContent) {
        horoscopeResultContent.innerHTML = horoscope;
    }
    
    closeHoroscopeModal();
    if (horoscopeResultModal) horoscopeResultModal.classList.add('active');
}

// 운세 생성 함수
function generateHoroscope(zodiacSign, birthDate) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();
    
    const zodiacData = {
        '양자리': { lucky: ['용기', '결단력', '성공'], color: '빨강', number: [1, 9, 21], keyword: '활기와 에너지' },
        '황소자리': { lucky: ['안정', '인내', '풍요'], color: '녹색', number: [2, 6, 24], keyword: '안정과 지속' },
        '쌍둥이자리': { lucky: ['소통', '변화', '지식'], color: '노랑', number: [3, 12, 21], keyword: '소통과 변화' },
        '게자리': { lucky: ['감정', '직감', '보호'], color: '은색', number: [4, 7, 28], keyword: '감정과 직감' },
        '사자자리': { lucky: ['자신감', '리더십', '명예'], color: '금색', number: [5, 19, 23], keyword: '자신감과 리더십' },
        '처녀자리': { lucky: ['정리', '분석', '완벽'], color: '베이지', number: [6, 15, 24], keyword: '정리와 분석' },
        '천칭자리': { lucky: ['조화', '균형', '미'], color: '분홍', number: [7, 14, 21], keyword: '조화와 균형' },
        '전갈자리': { lucky: ['변화', '강렬함', '심층'], color: '검정', number: [8, 13, 27], keyword: '변화와 강렬함' },
        '사수자리': { lucky: ['모험', '자유', '철학'], color: '보라', number: [9, 18, 27], keyword: '모험과 자유' },
        '염소자리': { lucky: ['책임', '성취', '전통'], color: '갈색', number: [10, 16, 26], keyword: '책임과 성취' },
        '물병자리': { lucky: ['혁신', '독창성', '인도주의'], color: '청록', number: [11, 22, 33], keyword: '혁신과 독창성' },
        '물고기자리': { lucky: ['직감', '영감', '공감'], color: '바다색', number: [12, 19, 24], keyword: '직감과 영감' }
    };
    
    const data = zodiacData[zodiacSign] || zodiacData['양자리'];
    // 점수를 높게 설정 (기본 점수에 추가 보너스 적용)
    const baseScore = (birthDate.getDate() + birthDate.getMonth() + dayOfMonth) % 100;
    const bonusScore = Math.floor(Math.random() * 30) + 40; // 40-70 보너스
    const totalScore = Math.min(99, baseScore + bonusScore); // 최대 99점
    
    let luckLevel = '보통';
    let luckDesc = '';
    if (totalScore >= 80) {
        luckLevel = '대길';
        luckDesc = '오늘은 정말 운이 좋은 날입니다! 새로운 도전을 시작하기에 완벽한 시기입니다. 별자리의 힘이 당신에게 긍정적인 에너지를 불어넣고 있으며, 모든 일이 순조롭게 진행될 것입니다. 자신감을 가지고 목표에 도전해보세요. 특히 오후 시간대에 중요한 결정을 내리면 좋은 결과를 얻을 수 있습니다. 주변 사람들과의 협력도 큰 도움이 될 것입니다.';
    } else if (totalScore >= 60) {
        luckLevel = '길';
        luckDesc = '오늘은 좋은 일들이 기다리고 있는 날입니다. 긍정적인 마음가짐을 유지하세요. 하늘의 별들이 당신에게 호의적인 영향을 미치고 있어, 평소보다 더 밝고 긍정적인 에너지를 느낄 수 있습니다. 작은 노력도 큰 성과로 이어질 수 있는 시기이니 포기하지 말고 계속 도전해보세요. 특히 새로운 인연이나 기회가 찾아올 수 있으니 주변을 둘러보는 것을 잊지 마세요.';
    } else if (totalScore >= 40) {
        luckLevel = '평범';
        luckDesc = '오늘은 평범한 하루입니다. 조금만 노력하면 좋은 결과를 얻을 수 있습니다. 별자리의 영향이 중립적으로 작용하고 있어 특별한 변화는 없지만, 안정적인 하루를 보낼 수 있습니다. 무리하지 않고 자신의 페이스를 유지하면서 차근차근 계획을 실행해보세요. 작은 성취를 쌓아가는 것이 오늘의 목표입니다. 충분한 휴식도 잊지 마세요.';
    } else if (totalScore >= 20) {
        luckLevel = '소길';
        luckDesc = '오늘은 조금 신중해야 할 날입니다. 급하게 결정하지 말고 신중하게 행동하세요. 별자리의 흐름이 다소 복잡하게 움직이고 있어 중요한 결정은 신중하게 내리는 것이 좋습니다. 하지만 이것이 나쁜 날은 아닙니다. 충분한 생각과 준비를 통해 더 나은 선택을 할 수 있는 기회입니다. 주변 사람들의 조언을 듣는 것도 도움이 될 것입니다.';
    } else {
        luckLevel = '흉';
        luckDesc = '오늘은 조금 조심해야 할 날입니다. 중요한 결정은 내일로 미루는 것이 좋습니다. 별자리의 흐름이 불안정하게 움직이고 있어 섣불리 행동하기보다는 신중하게 상황을 관찰하는 것이 좋습니다. 큰 변화나 중요한 결정은 며칠 후로 미루는 것이 현명할 수 있습니다. 대신 작은 일들을 정리하고 마음을 차분히 가다듬는 하루를 보내세요.';
    }
    
    const luckyNumber = data.number[dayOfMonth % data.number.length];
    const advice = getDailyAdvice(zodiacSign, dayOfWeek);
    
    return `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 2.5em; margin-bottom: 10px;">${getLuckEmoji(luckLevel)}</div>
            <div style="font-size: 1.5em; font-weight: bold; color: ${getLuckColor(luckLevel)}; margin-bottom: 10px;">
                ${luckLevel} (${totalScore}점)
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <div style="font-size: 1.2em; font-weight: 600; margin-bottom: 15px; color: #333;">📋 종합 운세</div>
            <div style="line-height: 1.8; color: #555;">${luckDesc}</div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div style="background: #fff3cd; padding: 15px; border-radius: 12px; border-left: 4px solid #ffc107;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #856404;">🍀 오늘의 행운</div>
                <div style="color: #856404;">${data.lucky.join(', ')}</div>
            </div>
            <div style="background: #d1ecf1; padding: 15px; border-radius: 12px; border-left: 4px solid #0dcaf0;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #055160;">🎨 행운의 색깔</div>
                <div style="color: #055160;">${data.color}</div>
            </div>
            <div style="background: #d4edda; padding: 15px; border-radius: 12px; border-left: 4px solid #198754;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #0f5132;">🔢 행운의 숫자</div>
                <div style="color: #0f5132;">${luckyNumber}</div>
            </div>
            <div style="background: #f8d7da; padding: 15px; border-radius: 12px; border-left: 4px solid #dc3545;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #721c24;">💡 키워드</div>
                <div style="color: #721c24;">${data.keyword}</div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white; text-align: center;">
            <div style="font-size: 1.1em; font-weight: 600; margin-bottom: 10px;">✨ 오늘의 조언</div>
            <div style="font-size: 0.95em; line-height: 1.6; opacity: 0.95;">${advice}</div>
        </div>
    `;
}

// 운세 레벨에 따른 이모지
function getLuckEmoji(level) {
    const emojis = { '대길': '🌟', '길': '✨', '평범': '💫', '소길': '⭐', '흉': '🌙' };
    return emojis[level] || '💫';
}

// 운세 레벨에 따른 색상
function getLuckColor(level) {
    const colors = { '대길': '#28a745', '길': '#17a2b8', '평범': '#ffc107', '소길': '#fd7e14', '흉': '#dc3545' };
    return colors[level] || '#6c757d';
}

// 오늘의 조언 생성
function getDailyAdvice(zodiacSign, dayOfWeek) {
    const advices = {
        '양자리': ['오늘은 새로운 도전을 시작하기 좋은 날입니다. 과감하게 행동하세요.', '리더십을 발휘할 기회가 있습니다.', '오늘은 휴식이 필요합니다.', '창의적인 아이디어가 떠오를 수 있습니다.', '소통이 중요한 하루입니다.', '오늘은 계획을 세우기에 좋은 날입니다.', '가족이나 친구들과 시간을 보내면 좋습니다.'],
        '황소자리': ['안정을 추구하는 하루입니다.', '오늘은 재정 관리에 신경 쓰는 것이 좋습니다.', '예술적 감성이 높아지는 날입니다.', '건강을 돌보는 것이 중요합니다.', '오늘은 인내심이 필요합니다.', '자연을 만끽하면 마음의 평화를 얻을 수 있습니다.', '오늘은 감각적인 즐거움을 추구하기 좋은 날입니다.'],
        '쌍둥이자리': ['정보 수집이 중요한 하루입니다.', '소통이 활발한 날입니다.', '오늘은 변화를 수용하는 자세가 필요합니다.', '짧은 여행이나 산책이 기분 전환에 도움이 됩니다.', '다양한 관점을 수용하면 좋은 아이디어가 떠오릅니다.', '오늘은 학습에 집중하기 좋은 날입니다.', '친구들과의 대화가 영감을 줄 수 있습니다.'],
        '게자리': ['감정에 충실한 하루입니다.', '가족과의 시간이 중요합니다.', '오늘은 과거를 회상하며 마음을 정리하기 좋은 날입니다.', '직감이 강한 날입니다.', '집 정리가 마음을 편하게 만들어줍니다.', '요리나 수공예 같은 창작 활동이 기분을 좋게 만듭니다.', '오늘은 조용한 곳에서 휴식을 취하는 것이 좋습니다.'],
        '사자자리': ['자신감이 넘치는 하루입니다.', '오늘은 주목받을 수 있는 기회가 있습니다.', '창의력이 높아지는 날입니다.', '리더십을 발휘할 상황이 있을 수 있습니다.', '오늘은 자신을 돌보는 것이 중요합니다.', '운동이나 활동적인 일이 기분을 좋게 만듭니다.', '주말에는 즐거운 활동을 계획하세요.'],
        '처녀자리': ['정리 정돈이 필요한 하루입니다.', '세부 사항에 집중하면 좋은 결과를 얻을 수 있습니다.', '오늘은 건강 관리를 하는 것이 좋습니다.', '계획을 세우고 실행하는 데 집중하세요.', '작은 일들을 완벽하게 해내면 만족감을 느낄 수 있습니다.', '오늘은 독서나 학습에 시간을 투자하세요.', '주변을 깔끔하게 정리하면 마음도 정리됩니다.'],
        '천칭자리': ['균형이 중요한 하루입니다.', '협력이 필요한 상황입니다.', '오늘은 아름다운 것들을 감상하면 마음이 평온해집니다.', '중요한 결정은 혼자 하지 말고 상의하세요.', '예술이나 미술 활동이 기분을 좋게 만듭니다.', '오늘은 관계를 개선하기 좋은 날입니다.', '평화로운 환경에서 휴식을 취하세요.'],
        '전갈자리': ['변화를 준비하는 하루입니다.', '깊이 있는 대화가 관계를 개선시킬 수 있습니다.', '오늘은 내면을 들여다보는 시간을 가지세요.', '강렬한 에너지가 필요한 일을 처리하기 좋은 날입니다.', '오늘은 신비로운 주제에 관심을 가져보세요.', '변화를 두려워하지 말고 수용하세요.', '주변 사람들에게 진심으로 다가가면 좋은 결과를 얻을 수 있습니다.'],
        '사수자리': ['모험을 즐기는 하루입니다.', '오늘은 여행이나 새로운 장소 탐험을 고려해보세요.', '자유를 추구하는 날입니다.', '철학적인 주제에 대해 생각해보면 인생에 대한 통찰을 얻을 수 있습니다.', '오늘은 다양한 사람들을 만나며 네트워킹을 하세요.', '활동적인 하루가 기분을 좋게 만듭니다.', '주말에는 야외 활동을 계획하세요.'],
        '염소자리': ['목표 달성에 집중하는 하루입니다.', '오늘은 장기적인 계획을 세우기에 좋은 날입니다.', '책임감 있는 태도가 인정을 받을 수 있습니다.', '전통적인 방법을 활용하면 안정적인 결과를 얻을 수 있습니다.', '오늘은 조금 더 신중하게 행동하세요.', '계획을 세우고 차근차근 실행하세요.', '주말에는 휴식을 취하며 다음 주를 준비하세요.'],
        '물병자리': ['혁신적인 아이디어가 떠오를 수 있습니다.', '오늘은 독특한 방식으로 문제를 해결해보세요.', '사람들과의 교류가 새로운 영감을 줄 수 있습니다.', '기술이나 새로운 트렌드에 관심을 가져보세요.', '오늘은 자유로운 생각을 하는 것이 좋습니다.', '사회적 문제나 인도주의적 활동에 관심을 가지세요.', '주말에는 새로운 취미를 시작해보세요.'],
        '물고기자리': ['직감이 강한 하루입니다.', '오늘은 창의적인 활동이 영감을 줄 수 있습니다.', '감정에 충실하면서도 현실을 놓치지 마세요.', '예술이나 음악이 마음을 평온하게 만듭니다.', '오늘은 혼자만의 시간을 가지면 좋습니다.', '꿈을 기록하면 의미 있는 메시지를 발견할 수 있습니다.', '주변 사람들의 감정을 이해하고 공감하세요.']
    };
    
    const zodiacAdvices = advices[zodiacSign] || advices['양자리'];
    return zodiacAdvices[dayOfWeek] || zodiacAdvices[0];
}
