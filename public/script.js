<<<<<<< HEAD
// 전역 변수
let currentFile = null;
let extractedText = '';

// DOM 요소들
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileInfoSection = document.getElementById('fileInfoSection');
const textSection = document.getElementById('textSection');
const actionSection = document.getElementById('actionSection');
const translateSection = document.getElementById('translateSection');
const summarizeSection = document.getElementById('summarizeSection');
const resultSection = document.getElementById('resultSection');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    // 파일 업로드 관련
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    uploadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    // 파일 제거
    document.getElementById('removeFile').addEventListener('click', removeFile);

    // 액션 버튼들
    document.getElementById('translateBtn').addEventListener('click', () => showTranslateSection());
    document.getElementById('summarizeBtn').addEventListener('click', () => showSummarizeSection());
    document.getElementById('bothBtn').addEventListener('click', () => showBothSections());

    // 실행 버튼들
    document.getElementById('executeTranslate').addEventListener('click', executeTranslate);
    document.getElementById('executeSummarize').addEventListener('click', executeSummarize);

    // 결과 관련
    document.getElementById('copyResult').addEventListener('click', copyResult);
    document.getElementById('downloadResult').addEventListener('click', downloadResult);
}

// 드래그 앤 드롭 처리
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

// 파일 선택 처리
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

// 파일 처리
async function processFile(file) {
    currentFile = file;
    
    // 파일 정보 표시
    showFileInfo(file);
    
    // 텍스트 추출
    showLoading('텍스트 추출 중...');
    
    try {
        const text = await extractTextFromFile(file);
        extractedText = text;
        
        if (text) {
            showExtractedText(text);
            showActionSection();
        } else {
            showError('텍스트를 추출할 수 없습니다.');
        }
    } catch (error) {
        showError('파일 처리 중 오류가 발생했습니다: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 파일에서 텍스트 추출
async function extractTextFromFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    // 파일을 Base64로 인코딩
    const base64 = await fileToBase64(file);
    
    const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            file_data: base64,
            file_type: file.type,
            file_name: file.name
        })
    });
    
    const result = await response.json();
    
    if (result.success) {
        return result.extracted_text;
    } else {
        throw new Error(result.error);
    }
}

// 파일을 Base64로 변환
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

// 파일 정보 표시
function showFileInfo(file) {
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    fileInfoSection.style.display = 'block';
}

// 파일 크기 포맷팅
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 추출된 텍스트 표시
function showExtractedText(text) {
    document.getElementById('extractedText').textContent = text;
    textSection.style.display = 'block';
}

// 액션 섹션 표시
function showActionSection() {
    actionSection.style.display = 'block';
}

// 번역 섹션 표시
function showTranslateSection() {
    translateSection.style.display = 'block';
    summarizeSection.style.display = 'none';
}

// 요약 섹션 표시
function showSummarizeSection() {
    summarizeSection.style.display = 'block';
    translateSection.style.display = 'none';
}

// 둘 다 표시
function showBothSections() {
    translateSection.style.display = 'block';
    summarizeSection.style.display = 'block';
}

// 번역 실행
async function executeTranslate() {
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;
    
    showLoading('번역 중...');
    
    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: extractedText,
                source_lang: sourceLang,
                target_lang: targetLang
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showResult('번역 결과', result.translated_text);
        } else {
            showError('번역 중 오류가 발생했습니다: ' + result.error);
        }
    } catch (error) {
        showError('번역 중 오류가 발생했습니다: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 요약 실행
async function executeSummarize() {
    const method = document.getElementById('summarizeMethod').value;
    const sentenceCount = parseInt(document.getElementById('sentenceCount').value);
    
    showLoading('요약 중...');
    
    try {
        const response = await fetch('/api/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: extractedText,
                method: method,
                sentences_count: sentenceCount
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showResult('요약 결과', result.summary);
        } else {
            showError('요약 중 오류가 발생했습니다: ' + result.error);
        }
    } catch (error) {
        showError('요약 중 오류가 발생했습니다: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 결과 표시
function showResult(title, content) {
    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = `<h4>${title}</h4><div class="result-text">${content}</div>`;
    resultSection.style.display = 'block';
    
    // 결과 섹션으로 스크롤
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// 오류 표시
function showError(message) {
    alert('오류: ' + message);
}

// 로딩 표시
function showLoading(text) {
    loadingText.textContent = text;
    loadingOverlay.style.display = 'flex';
}

// 로딩 숨기기
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// 파일 제거
function removeFile() {
    currentFile = null;
    extractedText = '';
    
    // 모든 섹션 숨기기
    fileInfoSection.style.display = 'none';
    textSection.style.display = 'none';
    actionSection.style.display = 'none';
    translateSection.style.display = 'none';
    summarizeSection.style.display = 'none';
    resultSection.style.display = 'none';
    
    // 파일 입력 초기화
    fileInput.value = '';
}

// 결과 복사
function copyResult() {
    const resultText = document.querySelector('.result-text');
    if (resultText) {
        navigator.clipboard.writeText(resultText.textContent).then(() => {
            alert('결과가 클립보드에 복사되었습니다.');
        }).catch(err => {
            console.error('복사 실패:', err);
            alert('복사에 실패했습니다.');
        });
    }
}

// 결과 다운로드
function downloadResult() {
    const resultText = document.querySelector('.result-text');
    if (resultText) {
        const content = resultText.textContent;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'result.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
=======
// 전역 변수
let currentFile = null;
let extractedText = '';

// DOM 요소들
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileInfoSection = document.getElementById('fileInfoSection');
const textSection = document.getElementById('textSection');
const actionSection = document.getElementById('actionSection');
const translateSection = document.getElementById('translateSection');
const summarizeSection = document.getElementById('summarizeSection');
const resultSection = document.getElementById('resultSection');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    // 파일 업로드 관련
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    uploadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    // 파일 제거
    document.getElementById('removeFile').addEventListener('click', removeFile);

    // 액션 버튼들
    document.getElementById('translateBtn').addEventListener('click', () => showTranslateSection());
    document.getElementById('summarizeBtn').addEventListener('click', () => showSummarizeSection());
    document.getElementById('bothBtn').addEventListener('click', () => showBothSections());

    // 실행 버튼들
    document.getElementById('executeTranslate').addEventListener('click', executeTranslate);
    document.getElementById('executeSummarize').addEventListener('click', executeSummarize);

    // 결과 관련
    document.getElementById('copyResult').addEventListener('click', copyResult);
    document.getElementById('downloadResult').addEventListener('click', downloadResult);
}

// 드래그 앤 드롭 처리
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

// 파일 선택 처리
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

// 파일 처리
async function processFile(file) {
    currentFile = file;
    
    // 파일 정보 표시
    showFileInfo(file);
    
    // 텍스트 추출
    showLoading('텍스트 추출 중...');
    
    try {
        const text = await extractTextFromFile(file);
        extractedText = text;
        
        if (text) {
            showExtractedText(text);
            showActionSection();
        } else {
            showError('텍스트를 추출할 수 없습니다.');
        }
    } catch (error) {
        showError('파일 처리 중 오류가 발생했습니다: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 파일에서 텍스트 추출
async function extractTextFromFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    // 파일을 Base64로 인코딩
    const base64 = await fileToBase64(file);
    
    const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            file_data: base64,
            file_type: file.type,
            file_name: file.name
        })
    });
    
    const result = await response.json();
    
    if (result.success) {
        return result.extracted_text;
    } else {
        throw new Error(result.error);
    }
}

// 파일을 Base64로 변환
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

// 파일 정보 표시
function showFileInfo(file) {
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    fileInfoSection.style.display = 'block';
}

// 파일 크기 포맷팅
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 추출된 텍스트 표시
function showExtractedText(text) {
    document.getElementById('extractedText').textContent = text;
    textSection.style.display = 'block';
}

// 액션 섹션 표시
function showActionSection() {
    actionSection.style.display = 'block';
}

// 번역 섹션 표시
function showTranslateSection() {
    translateSection.style.display = 'block';
    summarizeSection.style.display = 'none';
}

// 요약 섹션 표시
function showSummarizeSection() {
    summarizeSection.style.display = 'block';
    translateSection.style.display = 'none';
}

// 둘 다 표시
function showBothSections() {
    translateSection.style.display = 'block';
    summarizeSection.style.display = 'block';
}

// 번역 실행
async function executeTranslate() {
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;
    
    showLoading('번역 중...');
    
    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: extractedText,
                source_lang: sourceLang,
                target_lang: targetLang
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showResult('번역 결과', result.translated_text);
        } else {
            showError('번역 중 오류가 발생했습니다: ' + result.error);
        }
    } catch (error) {
        showError('번역 중 오류가 발생했습니다: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 요약 실행
async function executeSummarize() {
    const method = document.getElementById('summarizeMethod').value;
    const sentenceCount = parseInt(document.getElementById('sentenceCount').value);
    
    showLoading('요약 중...');
    
    try {
        const response = await fetch('/api/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: extractedText,
                method: method,
                sentences_count: sentenceCount
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showResult('요약 결과', result.summary);
        } else {
            showError('요약 중 오류가 발생했습니다: ' + result.error);
        }
    } catch (error) {
        showError('요약 중 오류가 발생했습니다: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 결과 표시
function showResult(title, content) {
    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = `<h4>${title}</h4><div class="result-text">${content}</div>`;
    resultSection.style.display = 'block';
    
    // 결과 섹션으로 스크롤
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

// 오류 표시
function showError(message) {
    alert('오류: ' + message);
}

// 로딩 표시
function showLoading(text) {
    loadingText.textContent = text;
    loadingOverlay.style.display = 'flex';
}

// 로딩 숨기기
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// 파일 제거
function removeFile() {
    currentFile = null;
    extractedText = '';
    
    // 모든 섹션 숨기기
    fileInfoSection.style.display = 'none';
    textSection.style.display = 'none';
    actionSection.style.display = 'none';
    translateSection.style.display = 'none';
    summarizeSection.style.display = 'none';
    resultSection.style.display = 'none';
    
    // 파일 입력 초기화
    fileInput.value = '';
}

// 결과 복사
function copyResult() {
    const resultText = document.querySelector('.result-text');
    if (resultText) {
        navigator.clipboard.writeText(resultText.textContent).then(() => {
            alert('결과가 클립보드에 복사되었습니다.');
        }).catch(err => {
            console.error('복사 실패:', err);
            alert('복사에 실패했습니다.');
        });
    }
}

// 결과 다운로드
function downloadResult() {
    const resultText = document.querySelector('.result-text');
    if (resultText) {
        const content = resultText.textContent;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'result.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
>>>>>>> 9472b9af39430ddd3198f479299d213279462014
