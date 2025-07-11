// 비밀번호 설정
const DEPARTMENT_PASSWORD = "1234";

// 비밀번호 확인 함수
function checkPassword(inputPassword) {
    return inputPassword === DEPARTMENT_PASSWORD;
}

// 모듈 export (필요한 경우)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkPassword };
}