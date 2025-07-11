// firebase-config.js - Firebase 설정 및 연동
class FirebaseSync {
    constructor() {
        this.isConnected = false;
        this.database = null;
        // 기본 Firebase 설정 (미리 입력)
        this.config = {
            apiKey: "AIzaSyCaQ6ndqGrR_x6fvTrZxdf5cHTNnRIj2Gg",
            authDomain: "busvacation-e894a.firebaseapp.com",
            databaseURL: "https://busvacation-e894a-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "busvacation-e894a",
            storageBucket: "busvacation-e894a.firebasestorage.app",
            messagingSenderId: "919121046118",
            appId: "1:919121046118:web:033047c3f1bba2164e5ba7",
            measurementId: "G-LBH4VTYQDS"
        };
    }

    // Firebase 초기화 (구성 파일 확인)
    async init(customConfig = null) {
        // config 파일의 설정 확인
        if (typeof FIREBASE_CONFIG !== 'undefined' && isFirebaseConfigured()) {
            this.config = FIREBASE_CONFIG;
            console.log('config/firebase-config.js 파일의 설정을 사용합니다.');
        } else {
            // localStorage에서 설정 확인
            const savedConfig = localStorage.getItem('firebaseConfig');
            if (savedConfig) {
                this.config = JSON.parse(savedConfig);
                console.log('localStorage의 설정을 사용합니다.');
            } else {
                console.log('기본 Firebase 설정을 사용합니다.');
            }
        }
        
        const configToUse = customConfig || this.config;
        
        if (!configToUse.apiKey) {
            console.log('Firebase 설정이 없습니다. 로컬 모드로 실행됩니다.');
            return false;
        }

        try {
            // Firebase SDK 동적 로드
            if (!window.firebase) {
                await this.loadFirebaseSDK();
            }

            firebase.initializeApp(configToUse);
            this.database = firebase.database();
            this.isConnected = true;

            console.log('Firebase 연결 성공');
            this.setupRealtimeListeners();
            return true;
        } catch (error) {
            console.error('Firebase 초기화 실패:', error);
            return false;
        }
    }

    // Firebase SDK 동적 로드
    async loadFirebaseSDK() {
        return new Promise((resolve, reject) => {
            const script1 = document.createElement('script');
            script1.src = 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js';
            script1.onload = () => {
                const script2 = document.createElement('script');
                script2.src = 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database-compat.js';
                script2.onload = resolve;
                script2.onerror = reject;
                document.head.appendChild(script2);
            };
            script1.onerror = reject;
            document.head.appendChild(script1);
        });
    }

    // 실시간 리스너 설정
    setupRealtimeListeners() {
        if (!this.isConnected) return;

        // 휴가 데이터 실시간 동기화
        this.database.ref('vacations').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data && data !== storage.getVacations()) {
                console.log('휴가 데이터 실시간 업데이트 수신');
                storage.saveVacations(data);
                if (typeof calendar !== 'undefined' && calendar.refresh) {
                    calendar.refresh();
                }
            }
        });

        // 직원 데이터 실시간 동기화 (초기 로드 차단)
        this.database.ref('employees').on('value', (snapshot) => {
            const data = snapshot.val();
            
            // 현재 로컬에 직원 데이터가 있으면 Firebase 데이터 무시
            if (storage.employeeData && Object.keys(storage.employeeData).length > 0) {
                console.log('로컬에 직원 데이터가 있음 - Firebase 데이터 무시');
                return;
            }
            
            if (data && JSON.stringify(data) !== JSON.stringify(storage.employeeData)) {
                console.log('유효한 직원 데이터 실시간 업데이트 수신');
                storage.employeeData = data;
                storage.saveEmployeeData();
                if (typeof vacationManager !== 'undefined' && vacationManager.loadFilterCheckboxes) {
                    vacationManager.loadFilterCheckboxes();
                }
            }
        });

        // 부서 데이터 실시간 동기화 (초기 로드 차단)
        this.database.ref('departments').on('value', (snapshot) => {
            const data = snapshot.val();
            
            // 현재 로컬에 부서 데이터가 있으면 Firebase 데이터 무시
            if (storage.getDepartments() && storage.getDepartments().length > 0) {
                console.log('로컬에 부서 데이터가 있음 - Firebase 데이터 무시');
                return;
            }
            
            if (data && JSON.stringify(data) !== JSON.stringify(storage.getDepartments())) {
                console.log('부서 데이터 실시간 업데이트 수신');
                storage.departments = data;
                storage.saveDepartments();
                if (typeof vacationManager !== 'undefined' && vacationManager.loadFilterCheckboxes) {
                    vacationManager.loadFilterCheckboxes();
                }
            }
        });
    }

    // 데이터를 Firebase에 업로드
    async syncToFirebase() {
        if (!this.isConnected) return false;

        try {
            const updates = {
                'vacations': storage.getVacations(),
                'employees': storage.employeeData,
                'departments': storage.getDepartments(),
                'lastUpdated': firebase.database.ServerValue.TIMESTAMP
            };

            await this.database.ref().update(updates);
            console.log('Firebase에 데이터 동기화 완료');
            return true;
        } catch (error) {
            console.error('Firebase 동기화 실패:', error);
            return false;
        }
    }

    // Firebase에서 데이터 다운로드
    async loadFromFirebase() {
        if (!this.isConnected) return false;

        try {
            const snapshot = await this.database.ref().once('value');
            const data = snapshot.val();

            if (data) {
                if (data.vacations) {
                    storage.saveVacations(data.vacations);
                }
                if (data.employees) {
                    storage.employeeData = data.employees;
                    storage.saveEmployeeData();
                }
                if (data.departments) {
                    storage.departments = data.departments;
                    storage.saveDepartments();
                }

                console.log('Firebase에서 데이터 로드 완료');
                return true;
            }
        } catch (error) {
            console.error('Firebase 데이터 로드 실패:', error);
        }
        return false;
    }

    // 연결 상태 확인
    isOnline() {
        return this.isConnected;
    }

    // 연결 해제
    disconnect() {
        if (this.database) {
            this.database.ref().off();
        }
        this.isConnected = false;
        console.log('Firebase 연결 해제');
    }
}

// 전역 FirebaseSync 인스턴스
const firebaseSync = new FirebaseSync();