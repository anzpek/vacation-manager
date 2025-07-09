# 부서 휴가 관리 시스템 - 유연한 개발 지침서

## 🎯 프로젝트 철학
"변화에 빠르게 대응하고, 사용자 요구를 즉시 반영하는 살아있는 시스템"

## 📋 개발 프로세스

### 1. 현황 파악 (Before Starting)
```
1. claude.md 파일 읽기 → 현재 상태 확인
2. 최근 변경사항 및 진행 중인 Phase 확인
3. 해결해야 할 이슈 목록 검토
```

### 2. 요구사항 분석 (Requirement Analysis)
```
요구사항 발생 시:
├── 즉시 claude.md에 기록
├── Phase 및 Step으로 분류
├── 우선순위 설정
└── 예상 영향 범위 파악
```

### 3. 개발 원칙 (Development Principles)

#### 3.1 점진적 개선 (Incremental Improvement)
- **작은 단위로 개발**: 한 번에 하나의 기능만 수정
- **즉시 테스트**: 변경 후 바로 동작 확인
- **롤백 가능**: 이전 상태로 돌아갈 수 있도록 백업

#### 3.2 문서 우선 (Documentation First)
```javascript
// 개발 플로우
1. claude.md 업데이트 (할 일 정의)
2. 코드 작성
3. 테스트
4. claude.md 업데이트 (완료 사항 기록)
```

#### 3.3 사용자 중심 (User-Centric)
- UI 변경 시 사용성 테스트 필수
- 기존 워크플로우 방해 금지
- 직관적인 인터페이스 유지

## 🔧 기술적 가이드라인

### 파일별 역할 정의
```
index.html      → 레이아웃 변경 시 수정
style.css       → 시각적 요소 변경
print.css       → 인쇄 관련 스타일
app.js          → 전체 앱 초기화
calendar.js     → 달력 렌더링 로직
vacation.js     → 휴가 CRUD 작업
employee.js     → 직원/팀 관리
storage.js      → 데이터 저장/불러오기
textParser.js   → 일괄 입력 처리
holidays.js     → 공휴일 데이터
print.js        → 인쇄 기능
```

### 데이터 구조 변경 시
```javascript
// storage.js에서 마이그레이션 함수 작성
function migrateData() {
    const oldData = localStorage.getItem('oldKey');
    if (oldData) {
        // 변환 로직
        localStorage.setItem('newKey', newData);
        localStorage.removeItem('oldKey');
    }
}
```

## 🚀 신속한 개발을 위한 체크리스트

### 새 기능 추가 시
- [ ] claude.md에 요구사항 기록
- [ ] 영향받는 파일 목록 작성
- [ ] 기존 기능과의 충돌 검토
- [ ] UI 스케치 또는 설명 추가
- [ ] 테스트 시나리오 정의

### 버그 수정 시
- [ ] 버그 재현 방법 기록
- [ ] 원인 분석 내용 작성
- [ ] 수정 방법 문서화
- [ ] 관련 코드 위치 명시
- [ ] 수정 후 테스트 결과 기록

### 코드 작성 시
```javascript
// 명확한 주석 추가
// TODO: 나중에 개선할 사항
// FIXME: 버그가 있는 부분
// NOTE: 중요한 설명

// 함수는 단일 책임 원칙
function doOneThingWell() {
    // 한 가지 일만 수행
}

// 변수명은 의미있게
const employeeVacationDays = 15; // Good
const days = 15; // Bad
```

## 📝 claude.md 활용법

### 실시간 업데이트
```markdown
## 현재 작업 중 (2025-07-04 14:30)
- 필터 UI 레이아웃 변경 중
- employee.js의 renderFilters() 함수 수정
- 문제: 체크박스 이벤트 핸들러 중복 발생
```

### 완료 후 기록
```markdown
## 완료된 작업 (2025-07-04 15:45)
- ✅ 필터 UI 왼쪽 이동 완료
- ✅ 팀별 전체 선택 기능 구현
- 💡 발견된 이슈: IE11에서 flexbox 레이아웃 깨짐
```

## 🔄 개발 사이클

### Phase 단위 작업
```
Phase 정의 → Step 분할 → 구현 → 테스트 → 문서화 → 다음 Phase
     ↑                                           ↓
     └───────────── 피드백 반영 ←─────────────────┘
```

### 일일 작업 플로우
1. **오전**: claude.md 확인, 오늘 할 일 정리
2. **작업 중**: 변경사항 실시간 기록
3. **오후**: 테스트 및 버그 수정
4. **마무리**: claude.md 업데이트, 내일 할 일 정리

## 🛡️ 안전장치

### 코드 품질 유지
- 기존 기능 테스트 후 새 기능 추가
- localStorage 데이터 백업
- 브라우저 호환성 체크 (Chrome, Firefox, Edge, Safari)

### 위험 신호
- 한 번에 3개 이상 파일 수정 → 분할 필요
- 100줄 이상 코드 추가 → 함수 분리 고려
- 기존 기능 깨짐 → 즉시 롤백

## 💡 팁 & 트릭

### 빠른 디버깅
```javascript
// 콘솔에 유용한 정보 출력
console.group('휴가 데이터');
console.table(vacations);
console.groupEnd();

// 성능 측정
console.time('렌더링');
renderCalendar();
console.timeEnd('렌더링');
```

### 효율적인 테스트
1. 극단적인 케이스 테스트 (0개, 1개, 100개)
2. 경계값 테스트 (월 시작/끝, 연도 변경)
3. 사용자 시나리오 테스트 (실제 사용 패턴)

## 🎨 UI/UX 가이드

### 색상 사용
- 기본 색상 팔레트 유지
- 새 색상 추가 시 storage.js의 colorPalette 수정
- 대비율 확인 (접근성)

### 레이아웃
- 모바일 우선 (Mobile First)
- Flexbox/Grid 활용
- 반응형 브레이크포인트 준수

## 📊 성과 측정

### 개발 속도
- Phase 완료 시간 기록
- 버그 수정 소요 시간 측정
- 사용자 피드백 반영 속도

### 품질 지표
- 버그 발생률
- 사용자 만족도
- 성능 (렌더링 시간)

## 🚨 긴급 대응

### 치명적 버그 발생 시
1. 즉시 claude.md에 "🚨 CRITICAL" 태그로 기록
2. 최소한의 수정으로 해결
3. 근본 원인은 나중에 분석
4. 핫픽스 후 전체 테스트

### 데이터 손실 위험
1. localStorage 백업 코드 실행
2. 사용자에게 export 기능 안내
3. 임시 복구 방안 제공

---

## 🎯 핵심 메시지
"claude.md는 우리의 나침반이다. 
 매일 확인하고, 즉시 업데이트하며, 
 팀의 모든 결정을 기록한다."

이 지침서 자체도 프로젝트와 함께 진화합니다.
필요한 내용은 언제든 추가/수정하세요.