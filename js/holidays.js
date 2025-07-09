// holidays.js - 대한민국 공휴일 관리

// YYYY-MM-DD 형식의 문자열을 로컬 시간대 Date 객체로 파싱
function parseDateString(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month는 0부터 시작
}

// Date 객체를 YYYY-MM-DD 형식의 문자열로 포맷팅 (로컬 시간대 기준)
function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const holidays = {
    // 캐시된 공휴일 데이터
    cachedHolidays: {},
    serviceKey: '7BZDblK8NIBj32BvDQ5jWi/YyHJJfhDHESiBYljCaocAPUQZc8IG5ltkJvlVR8J1AinP5izo2WA2F68xWyUTKA==',
    
    // 공휴일 정보 오픈API URL (data.go.kr)
    apiUrl: 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo',
    
    // 기본 공휴일 (API 실패시 사용)
    defaultHolidays: {
        2025: {
            '2025-01-01': '신정',
            '2025-01-28': '설날 연휴',
            '2025-01-29': '설날',
            '2025-01-30': '설날 연휴',
            '2025-03-01': '삼일절',
            '2025-03-03': '삼일절 대체공휴일',
            '2025-05-05': '어린이날·부처님오신날',
            '2025-05-06': '어린이날·부처님오신날 대체공휴일',
            '2025-06-06': '현충일',
            '2025-08-15': '광복절',
            '2025-10-03': '개천절',
            '2025-10-05': '추석 연휴',
            '2025-10-06': '추석',
            '2025-10-07': '추석 연휴',
            '2025-10-08': '추석 대체공휴일',
            '2025-10-09': '한글날',
            '2025-12-25': '성탄절'
        }
    },

    // 특정 연도의 공휴일 정보 로드 (API 호출)
    loadHolidays: async function(year) {
        if (this.cachedHolidays[year]) {
            return; // 이미 캐시된 정보가 있으면 중복 호출 방지
        }

        // 1. 기본 공휴일 데이터를 먼저 로드합니다.
        let yearHolidays = { ...(this.defaultHolidays[year] || {}) };

        if (!this.serviceKey) {
            console.warn('공휴일 API 서비스 키가 설정되지 않았습니다. 기본 데이터만 사용합니다.');
            this.cachedHolidays[year] = yearHolidays;
            return;
        }

        try {
            // 2. API를 통해 가져온 공휴일 정보로 기본 데이터를 보강(덮어쓰기)합니다.
            for (let month = 1; month <= 12; month++) {
                const monthStr = month.toString().padStart(2, '0');
                const url = `${this.apiUrl}?serviceKey=${this.serviceKey}&solYear=${year}&solMonth=${monthStr}`;
                
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`API 요청 실패: ${response.status}`);
                }
                const xmlText = await response.text();
                
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                
                const items = xmlDoc.getElementsByTagName('item');
                for (let item of items) {
                    const dateName = item.getElementsByTagName('dateName')[0].textContent;
                    const locdate = item.getElementsByTagName('locdate')[0].textContent; // YYYYMMDD
                    
                    const dateStr = `${locdate.substring(0, 4)}-${locdate.substring(4, 6)}-${locdate.substring(6, 8)}`;
                    
                    // API 응답에 '대체공휴일'이 포함된 경우, 기존 공휴일 이름에 덧붙여 표시합니다.
                    if (dateName.includes('대체공휴일') && yearHolidays[dateStr]) {
                         yearHolidays[dateStr] += `·${dateName}`;
                    } else {
                         yearHolidays[dateStr] = dateName;
                    }
                }
            }
            this.cachedHolidays[year] = yearHolidays;
        } catch (error) {
            console.error(`${year}년 공휴일 정보 가져오기 실패:`, error);
            // API 호출에 실패하더라도, 이미 로드된 기본 데이터는 유지됩니다.
            this.cachedHolidays[year] = yearHolidays;
        }
    },

    // 특정 연도의 공휴일 객체 가져오기 (동기)
    getHolidays: function(year) {
        return this.cachedHolidays[year] || {};
    },

    // 날짜가 공휴일인지 확인
    isHoliday: function(dateStr) {
        const year = new Date(dateStr).getFullYear();
        const holidays = this.getHolidays(year);
        return holidays.hasOwnProperty(dateStr);
    },

    // 날짜가 주말인지 확인
    isWeekend: function(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDay();
        return day === 0 || day === 6; // 일요일 또는 토요일
    },

    // 날짜가 휴일(주말 또는 공휴일)인지 확인
    isNonWorkingDay: function(dateStr) {
        return this.isWeekend(dateStr) || this.isHoliday(dateStr);
    },

    // 제헌절인지 확인 (공휴일은 아니지만 기념일)
    isMemorialDay: function(dateStr) {
        const holidays = this.getHolidays(new Date(dateStr).getFullYear());
        return holidays[dateStr] === '제헌절';
    }
};