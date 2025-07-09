# 🔥 실시간 공유 휴가 관리 시스템 사용 가이드

## 📋 개요
이 시스템은 Firebase Realtime Database를 사용하여 여러 사용자가 실시간으로 휴가 데이터를 공유하고 수정할 수 있습니다.

## 🚀 설정 방법

### 1단계: Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: "company-vacation-manager")
4. Google Analytics는 선택사항 (끄기 권장)

### 2단계: Realtime Database 설정
1. 좌측 메뉴에서 "Realtime Database" 클릭
2. "데이터베이스 만들기" 클릭
3. **"테스트 모드로 시작"** 선택 (중요!)
4. 위치 선택 (asia-southeast1 권장)

### 3단계: 웹앱 등록
1. 프로젝트 설정(⚙️ 아이콘) 클릭
2. "일반" 탭에서 "</>" (웹앱 추가) 클릭
3. 앱 닉네임 입력 (예: "vacation-web")
4. Firebase SDK 구성 정보 복사

### 4단계: 시스템 설정
1. 휴가 관리 시스템에서 "실시간 공유 설정" 버튼 클릭
2. Firebase 구성 정보 입력
3. "Firebase 연결" 버튼 클릭

## 👥 팀원들과 공유하기

### 방법 1: 웹 호스팅 (권장)
**GitHub Pages 사용**:
- GitHub에 새 저장소 생성
- 휴가 관리 시스템 파일들 업로드
- Settings > Pages에서 GitHub Pages 활성화
- 팀원들에게 URL 공유

**Netlify 사용**:
- [Netlify](https://netlify.com)에 가입
- "Add new site" > "Deploy manually"
- 휴가 관리 시스템 폴더를 드래그앤드롭
- 생성된 URL을 팀원들과 공유

### 방법 2: 파일 공유
1. 전체 폴더를 압축
2. 팀원들에게 전달
3. 각자 Firebase 설정 입력

## 🔧 실시간 동기화 기능

### 자동 동기화
- 휴가 추가/수정/삭제 시 자동으로 Firebase 업데이트
- 다른 사용자의 변경사항 실시간 반영
- 인터넷 연결 시에만 작동

### 수동 동기화
- "Firebase 동기화" 버튼으로 수동 업로드

## 📱 사용 방법

### 관리자 (최초 설정자)
1. Firebase 프로젝트 생성 및 설정
2. 초기 부서/직원 데이터 입력
3. "Firebase 동기화" 버튼으로 업로드
4. 팀원들에게 시스템 URL 공유

### 팀원들
1. 공유받은 URL 접속
2. "실시간 공유 설정"에서 Firebase 구성 정보 입력
3. 자동으로 데이터 다운로드
4. 본인 휴가 등록/수정

## 🎯 완료!
이제 실시간 공유 휴가 관리 시스템이 준비되었습니다!

팀원들은 URL만 접속하면 실시간으로 휴가 현황을 확인하고 본인 휴가를 등록할 수 있습니다.