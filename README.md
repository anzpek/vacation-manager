# 📅 부서 휴가 관리 시스템

직원들의 휴가를 한눈에 관리할 수 있는 웹 기반 휴가 관리 시스템입니다.  
Firebase 실시간 데이터베이스를 통해 여러 사용자가 동시에 사용할 수 있습니다.

## ✨ 주요 기능

### 🎯 휴가 관리
- **개별 휴가 등록**: 날짜를 클릭하여 휴가 등록
- **일괄 입력**: 여러 직원의 휴가를 한 번에 입력
- **범위 등록**: 시작일~종료일 범위로 휴가 등록
- **휴가 유형**: 연차휴가, 특별휴가, 오전반차, 오후반차 지원

### 👥 부서/직원 관리
- 부서, 팀, 직원 계층 구조 관리
- 직원별 색상 자동 지정
- 팀별/부서별 필터링 기능

### 🔥 실시간 공유
- Firebase를 통한 실시간 데이터 동기화
- 여러 사용자가 동시에 사용 가능
- 자동 백업 및 복구

### 🖨️ 기타 기능
- 달력 인쇄 (최대 6개월)
- 데이터 내보내기/가져오기
- 모바일 반응형 디자인

## 🚀 빠른 시작

### 1. GitHub Pages로 배포하기

1. 이 저장소를 Fork 또는 다운로드
2. GitHub에 새 저장소 생성
3. 코드 업로드
4. Settings → Pages → Source를 "Deploy from a branch"로 설정
5. Branch를 "main" → "/ (root)"로 설정
6. 생성된 URL로 접속 (예: `https://username.github.io/vacation-manager`)

### 2. Firebase 설정 (선택사항)

실시간 공유 기능을 사용하려면 Firebase 설정이 필요합니다.

#### 2-1. 기본 설정 사용 (테스트용)
- 별도 설정 없이 바로 사용 가능
- "실시간 공유 설정" → "Firebase 연결" 클릭

#### 2-2. 자체 Firebase 프로젝트 생성 (권장)

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 만들기" 클릭
3. 프로젝트 이름 입력 후 생성
4. 좌측 메뉴에서 "Realtime Database" 선택
5. "데이터베이스 만들기" → "테스트 모드로 시작"
6. 프로젝트 설정(⚙️) → "일반" → 하단의 "앱 추가" → 웹(</>) 아이콘 클릭
7. 앱 이름 입력 후 "앱 등록"
8. Firebase 구성 정보 복사

#### 2-3. Firebase 설정 적용

1. 휴가 관리 시스템의 "실시간 공유 설정" 메뉴 클릭
2. Firebase 구성 정보 입력
3. "설정 파일 생성" 클릭
4. 생성된 코드를 복사하여 `config/firebase-config.js` 파일로 저장
5. GitHub에 업로드

## 📱 사용 방법

### 기본 사용법

1. **부서 관리**에서 부서/팀/직원 등록
2. 달력에서 날짜 클릭하여 휴가 등록
3. 필터를 사용하여 원하는 직원만 표시

### 일괄 입력 형식

```
홍길동
0715
0716
0820(오전)

김철수
0801
0802
0803(오후)
```

### 휴가 유형
- **연차휴가**: 전일 휴가 (기본값)
- **특별휴가**: 경조사 등 특별 휴가
- **오전반차**: 오전만 휴가
- **오후반차**: 오후만 휴가

## 🔒 보안 설정

### 비밀번호 설정

`password/verify.js` 파일에서 비밀번호 변경:

```javascript
function checkPassword(password) {
    const hashedPassword = '여기에_해시된_비밀번호_입력';
    return hashPassword(password) === hashedPassword;
}
```

### Firebase 보안 규칙

Firebase Console에서 다음 규칙 설정:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## 🛠️ 기술 스택

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Database**: Firebase Realtime Database
- **Hosting**: GitHub Pages
- **특징**: 
  - 프레임워크 없이 순수 JavaScript로 구현
  - 외부 라이브러리 의존성 최소화
  - 모바일 반응형 디자인

## 📁 프로젝트 구조

```
vacation-manager/
├── index.html              # 메인 페이지
├── firebase-setup.html     # Firebase 설정 페이지
├── config/
│   └── firebase-config.js  # Firebase 설정 파일
├── css/
│   ├── style.css          # 메인 스타일
│   ├── mobile.css         # 모바일 스타일
│   └── print.css          # 인쇄 스타일
├── js/
│   ├── calendar.js        # 달력 렌더링
│   ├── vacation.js        # 휴가 관리
│   ├── storage.js         # 데이터 저장/불러오기
│   ├── firebase-sync.js   # Firebase 동기화
│   └── ...
└── password/
    └── verify.js          # 비밀번호 검증
```

## 🤝 기여하기

버그 제보나 기능 제안은 Issues 탭에서 등록해주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**제작**: 부서 휴가 관리 시스템 개발팀  
**문의**: [이메일 또는 연락처]
