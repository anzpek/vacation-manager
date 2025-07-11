// Firebase 설정 파일
// 이 파일은 Firebase 설정 페이지에서 자동으로 생성됩니다.
// 직접 수정하지 마세요.

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCaQ6ndqGrR_x6fvTrZxdf5cHTNnRIj2Gg",
    authDomain: "busvacation-e894a.firebaseapp.com",
    databaseURL: "https://busvacation-e894a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "busvacation-e894a",
    storageBucket: "busvacation-e894a.firebasestorage.app",
    messagingSenderId: "919121046118",
    appId: "1:919121046118:web:033047c3f1bba2164e5ba7"
};

// 설정이 완료되었는지 확인
const isFirebaseConfigured = () => {
    return FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey.length > 0;
};
